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

/* ─── Divisão da massa de correção entre pás adjacentes ──────────────────── */

export function splitBetweenBlades(Mc, angle, blades, bladeOffset = 0) {
    if (!Mc || Mc <= 0 || !blades || blades < 3 || !isFinite(angle)) return null;
    const pitch = 360 / blades;
    const rel = (((angle - bladeOffset) % 360) + 360) % 360;
    const k = Math.floor(rel / pitch);
    const alpha = rel - k * pitch;          // ângulo da pá A até o alvo
    const beta = pitch - alpha;             // do alvo até a pá B
    const sinP = Math.sin(toRad(pitch));
    const norm = (a) => ((a % 360) + 360) % 360;
    return {
        bladeA: k + 1,
        bladeB: ((k + 1) % blades) + 1,
        angleA: norm(bladeOffset + k * pitch),
        angleB: norm(bladeOffset + (k + 1) * pitch),
        massA: (Mc * Math.sin(toRad(beta))) / sinP,
        massB: (Mc * Math.sin(toRad(alpha))) / sinP,
    };
}

/* ─── Verificação pós-balanceamento ──────────────────────────────────────── */

export function reductionPercent(Vo, Vf) {
    return ((Vo - Vf) / Vo) * 100;
}

export function qualityStatus(reduction) {
    if (reduction >= 90) return { key: "excellent", label: "Excelente", tone: "ok" };
    if (reduction >= 70) return { key: "good", label: "Bom", tone: "ok" };
    if (reduction >= 50) return { key: "acceptable", label: "Aceitável", tone: "warn" };
    return { key: "redo", label: "Refazer", tone: "critical" };
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
