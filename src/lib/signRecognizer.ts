/**
 * signRecognizer.ts
 * 
 * Geometric ASL sign detection for MediaPipe hand landmarks.
 * 
 * MediaPipe landmark indices:
 *   0: Wrist
 *   1-4: Thumb (1=CMC, 2=MCP, 3=IP, 4=tip)
 *   5-8: Index (5=MCP, 6=PIP, 7=DIP, 8=tip)
 *   9-12: Middle (9=MCP, 10=PIP, 11=DIP, 12=tip)
 *   13-16: Ring (13=MCP, 14=PIP, 15=DIP, 16=tip)
 *   17-20: Pinky (17=MCP, 18=PIP, 19=DIP, 20=tip)
 */

export interface Landmark {
    x: number;
    y: number;
    z: number;
}

// ─── Core geometric helpers ───────────────────────────────────────────────────

/** Euclidean distance between two landmarks */
function dist(a: Landmark, b: Landmark): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Is a finger extended?
 * Compares the tip Y position against the PIP joint Y position.
 * In MediaPipe, Y increases downward — so a lower Y value = higher on screen = extended.
 * We use the MCP as an anchor to compute a normalized threshold.
 */
function isFingerExtended(
    tip: Landmark,
    pip: Landmark,
    mcp: Landmark,
    threshold = 0.6 // fraction of MCP-PIP distance the tip must be above PIP
): boolean {
    // Vector from MCP to PIP (the "base" direction of the finger)
    const mcpToPipY = pip.y - mcp.y;
    // If tip is above PIP by at least `threshold * |mcpToPipY|`, it's extended
    return pip.y - tip.y > Math.abs(mcpToPipY) * threshold;
}

/** Is the thumb extended? Uses a horizontal comparison since thumb extends sideways. */
function isThumbExtended(landmarks: Landmark[]): boolean {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    // Thumb tip should be noticeably farther from wrist than the thumb MCP
    return dist(thumbTip, wrist) > dist(thumbMcp, wrist) * 1.3;
}

/** Returns [index, middle, ring, pinky] extended state */
function getFingersExtended(lm: Landmark[]): [boolean, boolean, boolean, boolean] {
    const index = isFingerExtended(lm[8], lm[6], lm[5]);
    const middle = isFingerExtended(lm[12], lm[10], lm[9]);
    const ring = isFingerExtended(lm[16], lm[14], lm[13]);
    const pinky = isFingerExtended(lm[20], lm[18], lm[17]);
    return [index, middle, ring, pinky];
}

/**
 * Check how spread apart the extended fingers are.
 * "Hello" has fingers spread; "Thank You" has them together.
 */
export function areFingersTogether(lm: Landmark[], spreadThreshold = 0.06): boolean {
    // Compare adjacent fingertip distances
    const idxToMid = dist(lm[8], lm[12]);
    const midToRing = dist(lm[12], lm[16]);
    const ringToPink = dist(lm[16], lm[20]);
    // Use hand size (wrist to middle MCP) as a normalizing factor
    const handScale = dist(lm[0], lm[9]);

    const normalizedSpread = (idxToMid + midToRing + ringToPink) / 3 / handScale;
    return normalizedSpread < spreadThreshold;
}

/**
 * Is the palm roughly facing the camera?
 * We estimate this by checking that the knuckles (MCPs) form a roughly
 * horizontal line and that the wrist is below them (standard upright palm).
 */
export function isPalmFacingCamera(lm: Landmark[]): boolean {
    // The normal of the palm can be estimated from cross product, but a simpler
    // proxy: the middle finger MCP (9) should have a lower Z than the wrist (0)
    // when palm is facing camera. MediaPipe Z is depth — negative = closer.
    return lm[9].z < lm[0].z + 0.05;
}

// ─── Sign detectors ───────────────────────────────────────────────────────────

/**
 * HELLO (ASL)
 * Shape: Open palm, all 5 fingers fully extended and spread, palm faces outward.
 * Static proxy: all 4 fingers extended + thumb extended + fingers spread apart.
 *
 * Confidence scoring (0-1):
 *   +0.25 each finger extended (index, middle, ring, pinky)
 *   +0.25 thumb extended
 *   Penalty if fingers are too close together (more spread = better for Hello)
 *   Requires >= 0.85 to trigger
 */
function detectHello(lm: Landmark[]): number {
    const [index, middle, ring, pinky] = getFingersExtended(lm);
    const thumb = isThumbExtended(lm);

    let score = 0;
    if (index) score += 0.2;
    if (middle) score += 0.2;
    if (ring) score += 0.2;
    if (pinky) score += 0.2;
    if (thumb) score += 0.2;

    // Bonus: fingers should be spread (not together)
    const handScale = dist(lm[0], lm[9]);
    const spread = (dist(lm[8], lm[12]) + dist(lm[12], lm[16]) + dist(lm[16], lm[20])) / 3 / handScale;

    // spread > 0.08 means nicely spread fingers (good for Hello)
    // spread < 0.05 means fingers together (bad for Hello, good for Thank You)
    if (spread > 0.08) score += 0.1;
    else if (spread < 0.05) score -= 0.15; // penalty: looks like Thank You instead

    return Math.max(0, Math.min(1, score));
}

/**
 * THANK YOU (ASL)
 * Shape: Flat hand, fingers extended and held TOGETHER, fingertips touch
 *        near lips/chin, then move outward. 
 * Static proxy we can detect: all 4 fingers extended + close together + 
 *        thumb may be tucked or loosely extended.
 *
 * Key differentiator from Hello: fingers are TOGETHER not spread.
 *
 * Confidence scoring (0-1):
 *   +0.20 each of index, middle, ring, pinky extended
 *   +0.20 fingers held close together
 *   Penalty if fingers are too spread (looks like Hello)
 *   Requires >= 0.75 to trigger (slightly lower since thumb varies)
 */
function detectThankYou(lm: Landmark[]): number {
    const [index, middle, ring, pinky] = getFingersExtended(lm);

    let score = 0;
    if (index) score += 0.2;
    if (middle) score += 0.2;
    if (ring) score += 0.2;
    if (pinky) score += 0.2;

    // Critical: fingers must be TOGETHER
    const handScale = dist(lm[0], lm[9]);
    const spread = (dist(lm[8], lm[12]) + dist(lm[12], lm[16]) + dist(lm[16], lm[20])) / 3 / handScale;

    if (spread < 0.07) {
        score += 0.2; // Fingers are nicely together — strong Thank You signal
    } else if (spread > 0.10) {
        score -= 0.2; // Too spread — looks like Hello, penalise
    }

    return Math.max(0, Math.min(1, score));
}

// ─── Stability buffer ─────────────────────────────────────────────────────────

/**
 * We require the sign to be held consistently for N consecutive frames
 * before we accept it. This eliminates false positives from transient poses.
 */
const REQUIRED_HOLD_FRAMES = 15; // ~0.5 seconds at 30fps
const DETECTION_THRESHOLD_HELLO = 0.85;
const DETECTION_THRESHOLD_THANKYOU = 0.75;

const frameBuffer: { sign: string | null; count: number } = {
    sign: null,
    count: 0,
};

/**
 * Main exported function.
 * Returns the detected sign name if held for enough frames, otherwise null.
 */
export function detectSign(landmarks: Landmark[]): string | null {
    if (!landmarks || landmarks.length < 21) return null;

    const helloScore = detectHello(landmarks);
    const thankYouScore = detectThankYou(landmarks);

    // Determine the candidate sign this frame
    let candidateSign: string | null = null;

    if (helloScore >= DETECTION_THRESHOLD_HELLO && helloScore > thankYouScore) {
        candidateSign = 'Hello';
    } else if (thankYouScore >= DETECTION_THRESHOLD_THANKYOU && thankYouScore > helloScore) {
        candidateSign = 'Thank You';
    }

    // Stability: must be same sign for REQUIRED_HOLD_FRAMES in a row
    if (candidateSign === frameBuffer.sign) {
        frameBuffer.count++;
    } else {
        frameBuffer.sign = candidateSign;
        frameBuffer.count = 1;
    }

    if (frameBuffer.count >= REQUIRED_HOLD_FRAMES && candidateSign !== null) {
        // Reset so the same sign doesn't fire again immediately
        frameBuffer.count = 0;
        frameBuffer.sign = null;
        return candidateSign;
    }

    return null;
}

/** 
 * Debug helper — call this in your render loop to see live scores in the console.
 * Remove in production.
 */
export function debugScores(landmarks: Landmark[]): void {
    if (!landmarks || landmarks.length < 21) return;
    const h = detectHello(landmarks);
    const t = detectThankYou(landmarks);
    console.log(`[SignDebug] Hello: ${(h * 100).toFixed(0)}%  ThankYou: ${(t * 100).toFixed(0)}%`);
}
