/* ─── Math utilities for three-point rotor balancing ──────────────────────── */

export const toRad = (d) => d * Math.PI / 180;
export const toDeg = (r) => r * 180 / Math.PI;

export function parseVal(s) {
    const n = parseFloat(String(s).replace(",", "."));
    return isNaN(n) || n <= 0 ? null : n;
}

export function computeResult(Vo, V1, V2, V3, Mt) {
    const Px = (V3 * V3 - V2 * V2) / (2 * Math.sqrt(3) * Vo);
    const Py = (V2 * V2 + V3 * V3 - 2 * V1 * V1) / (6 * Vo);
    const OP = Math.sqrt(Px * Px + Py * Py);
    if (OP < 0.0001) return null;
    let angle = toDeg(Math.atan2(Px, Py));
    if (angle < 0) angle += 360;
    return { Px, Py, OP, angle, Mc: (Mt * Vo) / OP };
}

export function niceTick(v) {
    const raw = v / 3;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    if (n < 1.5) return mag;
    if (n < 3.5) return 2 * mag;
    if (n < 7.5) return 5 * mag;
    return 10 * mag;
}
