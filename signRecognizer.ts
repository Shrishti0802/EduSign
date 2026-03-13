/**
 * signRecognizer.ts
 *
 * Pure geometric ASL sign detection using MediaPipe hand landmarks.
 *
 * Corrected shapes based on actual ASL:
 *
 * HELLO     — open palm, all 5 fingers extended and SPREAD, near forehead
 * THANK YOU — curved/bent hand (fingers NOT fully extended), moves away from chin
 * PLEASE    — flat open hand on chest, fingers extended and TOGETHER (not spread)
 * YES       — closed fist, all fingers curled, thumb tucked, wrist bob
 * NO        — index + middle extended (peace sign), ring + pinky curled
 *
 * MediaPipe landmark indices:
 *   0: Wrist
 *   1-4:  Thumb  (1=CMC, 2=MCP, 3=IP,  4=tip)
 *   5-8:  Index  (5=MCP, 6=PIP, 7=DIP, 8=tip)
 *   9-12: Middle (9=MCP,10=PIP,11=DIP,12=tip)
 *   13-16:Ring   (13=MCP,14=PIP,15=DIP,16=tip)
 *   17-20:Pinky  (17=MCP,18=PIP,19=DIP,20=tip)
 */

export interface Landmark {
    x: number;
    y: number;
    z: number;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

function dist(a: Landmark, b: Landmark): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Finger fully extended — tip is well above PIP joint.
 * threshold=0.7 means tip must be 70% of the MCP→PIP bone length above PIP.
 */
function isExtended(tip: Landmark, pip: Landmark, mcp: Landmark, threshold = 0.7): boolean {
    const bone = Math.abs(pip.y - mcp.y);
    return pip.y - tip.y > bone * threshold;
}

/**
 * Finger bent/curved — tip is only slightly above or at PIP level.
 * This is the key shape for THANK YOU (fingers bent, not fully extended or curled).
 */
function isBent(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
    const bone = Math.abs(pip.y - mcp.y);
    const tipAbovePip = pip.y - tip.y;
    // Tip is a little above PIP but not fully extended
    return tipAbovePip > bone * 0.1 && tipAbovePip < bone * 0.65;
}

/**
 * Finger fully curled — tip is below or at PIP level.
 */
function isCurled(tip: Landmark, pip: Landmark, mcp: Landmark, threshold = 0.15): boolean {
    const bone = Math.abs(pip.y - mcp.y);
    return pip.y - tip.y < bone * threshold;
}

function isThumbExtended(lm: Landmark[]): boolean {
    return dist(lm[4], lm[0]) > dist(lm[2], lm[0]) * 1.3;
}

function isThumbCurled(lm: Landmark[]): boolean {
    return dist(lm[4], lm[5]) < dist(lm[2], lm[0]) * 0.7;
}

/** [index, middle, ring, pinky] */
function extendedFlags(lm: Landmark[]): [boolean, boolean, boolean, boolean] {
    return [
        isExtended(lm[8], lm[6], lm[5]),
        isExtended(lm[12], lm[10], lm[9]),
        isExtended(lm[16], lm[14], lm[13]),
        isExtended(lm[20], lm[18], lm[17]),
    ];
}

function curledFlags(lm: Landmark[]): [boolean, boolean, boolean, boolean] {
    return [
        isCurled(lm[8], lm[6], lm[5]),
        isCurled(lm[12], lm[10], lm[9]),
        isCurled(lm[16], lm[14], lm[13]),
        isCurled(lm[20], lm[18], lm[17]),
    ];
}

function bentFlags(lm: Landmark[]): [boolean, boolean, boolean, boolean] {
    return [
        isBent(lm[8], lm[6], lm[5]),
        isBent(lm[12], lm[10], lm[9]),
        isBent(lm[16], lm[14], lm[13]),
        isBent(lm[20], lm[18], lm[17]),
    ];
}

/**
 * Normalized spread between adjacent fingertips.
 * > 0.09 = spread wide apart
 * < 0.06 = fingers held together
 */
function fingerSpread(lm: Landmark[]): number {
    const scale = dist(lm[0], lm[9]);
    if (scale < 0.001) return 0;
    return (dist(lm[8], lm[12]) + dist(lm[12], lm[16]) + dist(lm[16], lm[20])) / 3 / scale;
}

// ─── Sign scorers ─────────────────────────────────────────────────────────────

/**
 * HELLO
 * Open palm — all 5 fingers fully EXTENDED and SPREAD wide.
 * Distinctly different from Please (which is fingers together).
 */
function scoreHello(lm: Landmark[]): number {
    const [ie, me, re, pe] = extendedFlags(lm);
    const thumb = isThumbExtended(lm);
    const spread = fingerSpread(lm);

    let score = 0;
    if (ie) score += 0.18;
    if (me) score += 0.18;
    if (re) score += 0.18;
    if (pe) score += 0.18;
    if (thumb) score += 0.18;

    // SPREAD is the key differentiator from Please
    if (spread > 0.09) score += 0.12;
    else if (spread < 0.06) score -= 0.25; // fingers together = Please not Hello

    return Math.max(0, Math.min(1, score));
}

/**
 * THANK YOU
 * Curved/bent hand — fingers are BENT at the middle joints (not fully extended,
 * not fully curled). Hand starts near chin and moves outward.
 * Static proxy: most fingers bent rather than fully extended or fully curled.
 */
function scoreThankYou(lm: Landmark[]): number {
    const [ib, mb, rb, pb] = bentFlags(lm);
    const [ie, me, re, pe] = extendedFlags(lm);
    const [ic, mc, rc, pc] = curledFlags(lm);

    let score = 0;

    // Bent fingers are the core signal
    if (ib) score += 0.22;
    if (mb) score += 0.22;
    if (rb) score += 0.18;
    if (pb) score += 0.18;

    // Penalty: fully extended fingers means Hello or Please, not Thank You
    const fullyExtended = [ie, me, re, pe].filter(Boolean).length;
    score -= fullyExtended * 0.10;

    // Penalty: fully curled fingers means Yes/fist, not Thank You
    const fullyCurled = [ic, mc, rc, pc].filter(Boolean).length;
    score -= fullyCurled * 0.08;

    return Math.max(0, Math.min(1, score));
}

/**
 * PLEASE
 * Flat open hand pressed against chest — fingers fully EXTENDED and TOGETHER.
 * Key differences:
 *   vs Hello: fingers TOGETHER (low spread), hand lower/against body
 *   vs Thank You: fingers FULLY extended, not bent
 */
function scorePlease(lm: Landmark[]): number {
    const [ie, me, re, pe] = extendedFlags(lm);
    const spread = fingerSpread(lm);
    const [ib, mb, rb, pb] = bentFlags(lm);

    let score = 0;
    if (ie) score += 0.20;
    if (me) score += 0.20;
    if (re) score += 0.20;
    if (pe) score += 0.20;

    // TOGETHER is the key differentiator from Hello
    if (spread < 0.07) score += 0.20;
    else if (spread > 0.09) score -= 0.25; // too spread = Hello, not Please

    // Penalty for bent fingers (that's Thank You shape)
    const bentCount = [ib, mb, rb, pb].filter(Boolean).length;
    score -= bentCount * 0.08;

    return Math.max(0, Math.min(1, score));
}

/**
 * YES
 * Tight closed fist — ALL fingers curled AND thumb tucked in.
 * Key differentiator from Please: nothing is extended.
 */
function scoreYes(lm: Landmark[]): number {
    const [ic, mc, rc, pc] = curledFlags(lm);
    const thumbCurled = isThumbCurled(lm);
    const thumbExtended = isThumbExtended(lm);
    const [ie, me, re, pe] = extendedFlags(lm);

    let score = 0;
    if (ic) score += 0.18;
    if (mc) score += 0.18;
    if (rc) score += 0.18;
    if (pc) score += 0.18;
    if (thumbCurled) score += 0.18;

    if (thumbExtended) score -= 0.30;
    const extCount = [ie, me, re, pe].filter(Boolean).length;
    score -= extCount * 0.15;

    return Math.max(0, Math.min(1, score));
}

/**
 * NO
 * Peace/victory sign — EXACTLY index + middle extended, ring + pinky curled.
 */
function scoreNo(lm: Landmark[]): number {
    const [ie, me, re, pe] = extendedFlags(lm);
    const [_ic, _mc, rc, pc] = curledFlags(lm);
    const thumbCurled = isThumbCurled(lm);

    let score = 0;
    if (ie) score += 0.25;
    if (me) score += 0.25;
    if (rc) score += 0.20;
    if (pc) score += 0.20;
    if (thumbCurled) score += 0.10;

    // Hard penalties — ring or pinky extended means it's not No
    if (re) score -= 0.40;
    if (pe) score -= 0.40;

    return Math.max(0, Math.min(1, score));
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS: Record<string, number> = {
    Hello: 0.78,
    ThankYou: 0.55, // lower because bent detection is softer than extended/curled
    Please: 0.75,
    Yes: 0.70,
    No: 0.75,
};

const DISPLAY_NAMES: Record<string, string> = {
    Hello: 'Hello',
    ThankYou: 'Thank You',
    Please: 'Please',
    Yes: 'Yes',
    No: 'No',
};

// ─── Stability buffer ─────────────────────────────────────────────────────────
// Sign must score above threshold for N consecutive frames to fire.
// Prevents false positives from transient hand positions.

const REQUIRED_HOLD_FRAMES = 18; // ~0.6s at 30fps
const frameBuffer = { sign: null as string | null, count: 0 };

// ─── Public API ───────────────────────────────────────────────────────────────

export function detectSign(landmarks: Landmark[]): string | null {
    if (!landmarks || landmarks.length < 21) return null;

    const scores: Record<string, number> = {
        Hello: scoreHello(landmarks),
        ThankYou: scoreThankYou(landmarks),
        Please: scorePlease(landmarks),
        Yes: scoreYes(landmarks),
        No: scoreNo(landmarks),
    };

    // Pick highest scorer that clears its threshold
    let bestKey: string | null = null;
    let bestScore = 0;
    for (const [key, score] of Object.entries(scores)) {
        if (score >= THRESHOLDS[key] && score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    }

    const candidateSign = bestKey ? DISPLAY_NAMES[bestKey] : null;

    // Stability gate
    if (candidateSign === frameBuffer.sign) {
        frameBuffer.count++;
    } else {
        frameBuffer.sign = candidateSign;
        frameBuffer.count = 1;
    }

    if (frameBuffer.count >= REQUIRED_HOLD_FRAMES && candidateSign !== null) {
        frameBuffer.count = 0;
        frameBuffer.sign = null;
        return candidateSign;
    }

    return null;
}

export function debugScores(landmarks: Landmark[]): void {
    if (!landmarks || landmarks.length < 21) return;
    const s = {
        Hello: scoreHello(landmarks),
        ThankYou: scoreThankYou(landmarks),
        Please: scorePlease(landmarks),
        Yes: scoreYes(landmarks),
        No: scoreNo(landmarks),
    };
    console.log(
        `[SignDebug] Hello:${(s.Hello * 100).toFixed(0)}%` +
        ` | TY:${(s.ThankYou * 100).toFixed(0)}%` +
        ` | Please:${(s.Please * 100).toFixed(0)}%` +
        ` | Yes:${(s.Yes * 100).toFixed(0)}%` +
        ` | No:${(s.No * 100).toFixed(0)}%`
    );
}