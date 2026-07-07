/* ─── Migração de dados v1 → schema v2 ───────────────────────────────────── */

const num = (s) => {
    const n = parseFloat(String(s ?? "").replace(",", "."));
    return isNaN(n) ? null : n;
};

export function migrateV1Sessions(storage = globalThis.localStorage) {
    let all;
    try {
        all = JSON.parse(storage.getItem("rba_sessions") ?? "[]");
    } catch {
        return;
    }
    if (!Array.isArray(all) || all.every((s) => s.schemaVersion === 2)) return;

    const migrated = all.map((s) => {
        if (s.schemaVersion === 2) return s;
        return {
            id: s.id,
            createdAt: s.timestamp ?? new Date().toISOString(),
            updatedAt: s.timestamp ?? new Date().toISOString(),
            schemaVersion: 2,
            client: { name: "", contact: "" },
            technician: "",
            machine: { tag: "", name: "", location: "", rpm: null, radius: null, blades: null, bladeOffset: 0 },
            measurements: {
                unit: "mm/s",
                Vo: num(s.raw?.Vo), V1: num(s.raw?.V1), V2: num(s.raw?.V2),
                V3: num(s.raw?.V3), Mt: num(s.raw?.Mt),
            },
            result: s.result ?? null,
            bladeSplit: null,
            verification: null,
            report: null,
            notes: s.name ?? "",
        };
    });
    storage.setItem("rba_sessions", JSON.stringify(migrated));
}
