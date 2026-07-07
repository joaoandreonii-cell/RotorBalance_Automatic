import { describe, it, expect, beforeEach } from "vitest";
import { createRepository } from "./repository.js";
import { migrateV1Sessions } from "./migrations.js";

function memStorage() {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: (k) => m.delete(k),
    };
}

let storage, repo;
beforeEach(() => {
    storage = memStorage();
    repo = createRepository(storage);
});

describe("sessions", () => {
    it("save gera id/timestamps e list retorna mais recente primeiro", () => {
        const a = repo.sessions.save({ notes: "a" });
        const b = repo.sessions.save({ notes: "b" });
        expect(a.id).toBeTruthy();
        expect(a.schemaVersion).toBe(2);
        expect(a.createdAt).toBeTruthy();
        const list = repo.sessions.list();
        expect(list.map((s) => s.notes)).toEqual(["b", "a"]);
        expect(repo.sessions.get(b.id).notes).toBe("b");
    });

    it("save com id existente atualiza (upsert)", () => {
        const a = repo.sessions.save({ notes: "a" });
        repo.sessions.save({ ...a, notes: "editada" });
        expect(repo.sessions.list()).toHaveLength(1);
        expect(repo.sessions.get(a.id).notes).toBe("editada");
        expect(repo.sessions.get(a.id).createdAt).toBe(a.createdAt);
    });

    it("remove e clear", () => {
        const a = repo.sessions.save({});
        repo.sessions.remove(a.id);
        expect(repo.sessions.list()).toEqual([]);
        repo.sessions.save({});
        repo.sessions.clear();
        expect(repo.sessions.list()).toEqual([]);
    });
});

describe("settings", () => {
    it("retorna defaults e faz merge no update", () => {
        expect(repo.settings.get()).toEqual({
            technician: "", company: "", contact: "",
            logo: null, defaultUnit: "mm/s", theme: "system",
        });
        repo.settings.update({ company: "ACME" });
        expect(repo.settings.get().company).toBe("ACME");
        expect(repo.settings.get().defaultUnit).toBe("mm/s");
    });
});

describe("nextReportNumber", () => {
    it("sequencial por ano com padding", () => {
        const year = new Date().getFullYear();
        expect(repo.nextReportNumber()).toBe(`RBA-${year}-001`);
        expect(repo.nextReportNumber()).toBe(`RBA-${year}-002`);
    });
});

describe("backup", () => {
    it("export/import substitui ou faz merge", () => {
        repo.sessions.save({ notes: "x" });
        repo.settings.update({ company: "ACME" });
        const data = repo.backup.export();
        expect(data.sessions).toHaveLength(1);
        expect(data.settings.company).toBe("ACME");

        const repo2 = createRepository(memStorage());
        repo2.sessions.save({ notes: "local" });
        repo2.backup.import(data, { merge: true });
        expect(repo2.sessions.list()).toHaveLength(2);

        const repo3 = createRepository(memStorage());
        repo3.sessions.save({ notes: "some" });
        repo3.backup.import(data, { merge: false });
        expect(repo3.sessions.list()).toHaveLength(1);
        expect(repo3.settings.get().company).toBe("ACME");
    });
});

describe("migração v1 → v2", () => {
    it("converte sessão v1 preservando resultado, e é idempotente", () => {
        const v1 = [{
            id: "abc123",
            timestamp: "2025-05-01T10:00:00.000Z",
            name: "Mc 4.68g @ 90.3°",
            raw: { Vo: "8", V1: "11,05", V2: "3.82", V3: "15.09", Mt: "4.5" },
            result: { Mc: 4.68, angle: 90.3, OP: 7.69, Px: 7.69, Py: -0.04 },
        }];
        storage.setItem("rba_sessions", JSON.stringify(v1));
        migrateV1Sessions(storage);
        const list = createRepository(storage).sessions.list();
        expect(list).toHaveLength(1);
        const s = list[0];
        expect(s.schemaVersion).toBe(2);
        expect(s.id).toBe("abc123");
        expect(s.createdAt).toBe("2025-05-01T10:00:00.000Z");
        expect(s.measurements).toEqual({ unit: "mm/s", Vo: 8, V1: 11.05, V2: 3.82, V3: 15.09, Mt: 4.5 });
        expect(s.result.Mc).toBe(4.68);
        expect(s.verification).toBeNull();
        // idempotente
        migrateV1Sessions(storage);
        expect(createRepository(storage).sessions.list()).toHaveLength(1);
    });
});
