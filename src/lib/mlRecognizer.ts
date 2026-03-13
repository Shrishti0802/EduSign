import type { Landmark } from './signRecognizer';

// A simple K-Nearest Neighbors (KNN) classifier for hand poses
class MLRecognizer {
  private trainingData: number[][] = [];
  private labels: string[] = [];

  // Normalize landmarks to be relative to the wrist (index 0)
  // This makes the detection translation-invariant (works no matter where the hand is on screen)
  private normalizeAndFlatten(landmarks: Landmark[]): number[] {
    if (landmarks.length === 0) return [];
    
    const wrist = landmarks[0];
    const flattened: number[] = [];
    
    // We want the size to be roughly scale-invariant too. Let's use distance from wrist to middle finger base
    // as a rough heuristic for hand size
    const handScale = Math.max(0.001, Math.sqrt(
      Math.pow(landmarks[9].x - wrist.x, 2) + Math.pow(landmarks[9].y - wrist.y, 2)
    ));

    for (const lm of landmarks) {
      // Relative to wrist, and scaled
      flattened.push((lm.x - wrist.x) / handScale);
      flattened.push((lm.y - wrist.y) / handScale);
      flattened.push((lm.z - wrist.z) / handScale); // use Z if available
    }

    return flattened;
  }

  // Calculate Euclidean distance between two feature vectors
  private distance(v1: number[], v2: number[]): number {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
        sum += Math.pow(v1[i] - v2[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Add a recorded example to the training set
  public addExample(landmarks: Landmark[], label: string) {
    const features = this.normalizeAndFlatten(landmarks);
    if (features.length > 0) {
      this.trainingData.push(features);
      this.labels.push(label);
    }
  }

  // Clear all training data
  public clear() {
    this.trainingData = [];
    this.labels = [];
  }

  public getExampleCount(): number {
    return this.trainingData.length;
  }
  
  public getCountsByLabel(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const lbl of this.labels) {
        counts[lbl] = (counts[lbl] || 0) + 1;
    }
    return counts;
  }

  // Predict the label of the current hand pose using KNN (k=3)
  public predict(landmarks: Landmark[], k: number = 3): { label: string | null; confidence: number } {
    if (this.trainingData.length === 0) {
      return { label: null, confidence: 0 };
    }

    const features = this.normalizeAndFlatten(landmarks);
    
    // Calculate distances to all training examples
    const distances = this.trainingData.map((data, index) => ({
      distance: this.distance(features, data),
      label: this.labels[index]
    }));

    // Sort by closest (lowest distance)
    distances.sort((a, b) => a.distance - b.distance);

    // If the closest distance is too far, it's probably random noise, not a trained pose
    // The threshold depends heavily on the normalization scale. Can be tuned.
    const DISTANCE_THRESHOLD = 5.0; 
    
    let validNeighbors = distances.slice(0, k).filter(d => d.distance < DISTANCE_THRESHOLD);
    
    if (validNeighbors.length === 0) {
      return { label: null, confidence: 0 }; // Too far from any known sign
    }

    // Voting
    const votes: Record<string, number> = {};
    for (const neighbor of validNeighbors) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    // Find the label with the most votes
    let bestLabel: string | null = null;
    let maxVotes = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        bestLabel = label;
      }
    }

    // Confidence is ratio of winning votes to total k
    const confidence = maxVotes / k;

    return { label: bestLabel, confidence };
  }
}

// Export a singleton instance
export const mlRecognizer = new MLRecognizer();
