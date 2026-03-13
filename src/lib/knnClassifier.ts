/**
 * knnClassifier.ts
 *
 * A KNN (K-Nearest Neighbors) classifier for ASL hand signs.
 * Uses TensorFlow.js to store landmark feature vectors and classify them.
 *
 * HOW IT WORKS:
 * 1. You record ~30 samples of each sign (hold button while doing sign)
 * 2. Each sample is converted to a 63-number feature vector (21 landmarks × x,y,z)
 * 3. KNN finds the closest stored samples to classify new frames
 * 4. No server, no training time — works instantly in the browser
 */

import * as tf from '@tensorflow/tfjs';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface Sample {
  features: number[];
  label: string;
}

// ─── Feature extraction ───────────────────────────────────────────────────────

/**
 * Converts 21 MediaPipe landmarks into a normalized 63-number feature vector.
 *
 * Normalization is critical — we:
 * 1. Translate so wrist (landmark 0) is at origin
 * 2. Scale so the hand always has the same "size" regardless of distance from camera
 *
 * This means the classifier works regardless of where your hand is on screen
 * or how far it is from the camera.
 */
export function extractFeatures(landmarks: Landmark[]): number[] {
  if (!landmarks || landmarks.length < 21) return [];

  // Step 1: Translate — make wrist the origin
  const wrist = landmarks[0];
  const translated = landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));

  // Step 2: Scale — normalize by the distance from wrist to middle finger MCP (landmark 9)
  // This makes the features scale-invariant (hand size / camera distance don't matter)
  const refDist = Math.sqrt(
    translated[9].x ** 2 +
    translated[9].y ** 2 +
    translated[9].z ** 2
  );

  if (refDist < 0.001) return new Array(63).fill(0);

  const normalized = translated.map(lm => ({
    x: lm.x / refDist,
    y: lm.y / refDist,
    z: lm.z / refDist,
  }));

  // Step 3: Flatten to a 1D array [x0,y0,z0, x1,y1,z1, ... x20,y20,z20]
  return normalized.flatMap(lm => [lm.x, lm.y, lm.z]);
}

// ─── KNN Classifier ───────────────────────────────────────────────────────────

class KNNSignClassifier {
  private samples: Sample[] = [];
  private k = 5; // number of nearest neighbors to consider
  private readonly STORAGE_KEY = 'edusign_tfs_knn_samples';

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.samples));
    } catch (e) {
      console.error('Failed to save KNN model to localStorage', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.samples = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load KNN model from localStorage', e);
    }
  }

  /** Add a training sample */
  addSample(landmarks: Landmark[], label: string): void {
    const features = extractFeatures(landmarks);
    if (features.length === 0) return;
    this.samples.push({ features, label });
    this.saveToStorage();
  }

  /** Predict the sign from landmarks. Returns label + confidence (0-1). */
  predict(landmarks: Landmark[]): { label: string | null; confidence: number } {
    if (this.samples.length < 3) return { label: null, confidence: 0 };

    const queryFeatures = extractFeatures(landmarks);
    if (queryFeatures.length === 0) return { label: null, confidence: 0 };

    // Compute Euclidean distance to every stored sample
    const distances = this.samples.map(sample => ({
      label: sample.label,
      distance: euclideanDistance(queryFeatures, sample.features),
    }));

    // Sort by distance ascending
    distances.sort((a, b) => a.distance - b.distance);

    // Take the k nearest neighbors
    const k = Math.min(this.k, distances.length);
    const neighbors = distances.slice(0, k);

    // Vote: count how many neighbors belong to each label
    const votes: Record<string, number> = {};
    for (const n of neighbors) {
      votes[n.label] = (votes[n.label] || 0) + 1;
    }

    // Find the winning label
    let bestLabel = '';
    let bestVotes = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > bestVotes) {
        bestVotes = count;
        bestLabel = label;
      }
    }

    const confidence = bestVotes / k;

    // Require at least 60% of neighbors to agree
    if (confidence < 0.6) return { label: null, confidence };

    return { label: bestLabel, confidence };
  }

  /** Get sample count per label */
  getCountsByLabel(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const s of this.samples) {
      counts[s.label] = (counts[s.label] || 0) + 1;
    }
    return counts;
  }

  /** Total number of stored samples */
  getTotalCount(): number {
    return this.samples.length;
  }

  /** Labels that have been trained */
  getTrainedLabels(): string[] {
    return [...new Set(this.samples.map(s => s.label))];
  }

  /** How many samples a specific label has */
  getCountForLabel(label: string): number {
    return this.samples.filter(s => s.label === label).length;
  }

  /** Remove all samples for a specific label */
  clearLabel(label: string): void {
    this.samples = this.samples.filter(s => s.label !== label);
    this.saveToStorage();
  }

  /** Clear everything */
  clearAll(): void {
    this.samples = [];
    this.saveToStorage();
  }

  /** Check if we have enough samples to start predicting */
  isReady(): boolean {
    const labels = this.getTrainedLabels();
    // Need at least 2 different signs trained, each with at least 10 samples
    return labels.length >= 2 && labels.every(l => this.getCountForLabel(l) >= 10);
  }
}

// ─── Euclidean distance ───────────────────────────────────────────────────────

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// ─── Stability buffer ─────────────────────────────────────────────────────────
// Prediction must be consistent for N frames before firing

const HOLD_FRAMES = 20; // ~0.67s at 30fps
const stableBuffer = { label: null as string | null, count: 0 };

export function stablePredict(
  classifier: KNNSignClassifier,
  landmarks: Landmark[]
): string | null {
  if (!classifier.isReady()) return null;

  const { label, confidence } = classifier.predict(landmarks);
  const candidate = confidence >= 0.6 ? label : null;

  if (candidate === stableBuffer.label) {
    stableBuffer.count++;
  } else {
    stableBuffer.label = candidate;
    stableBuffer.count = 1;
  }

  if (stableBuffer.count >= HOLD_FRAMES && candidate !== null) {
    stableBuffer.count = 0;
    stableBuffer.label = null;
    return candidate;
  }

  return null;
}

export function resetStableBuffer(): void {
  stableBuffer.label = null;
  stableBuffer.count = 0;
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const knnClassifier = new KNNSignClassifier();

// Suppress unused TF import warning — TF is used for future tensor ops
void tf;
