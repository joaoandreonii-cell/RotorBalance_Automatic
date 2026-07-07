/* ─── Formatação pt-BR ───────────────────────────────────────────────────── */

export function fmtNum(n, dec = 2) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
}

export function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}
