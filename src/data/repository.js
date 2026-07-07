/* ─── Porta única de acesso a dados (localStorage hoje, Supabase amanhã) ─── */

const KEYS = {
    sessions: "rba_sessions",
    settings: "rba_settings",
    counter: "rba_report_counter",
};

const DEFAULT_SETTINGS = {
    technician: "",
    company: "",
    contact: "",
    logo: null,
    defaultUnit: "mm/s",
    theme: "system",
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function createRepository(storage = globalThis.localStorage) {
    const read = (key, fallback) => {
        try {
            const v = storage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch {
            return fallback;
        }
    };
    const write = (key, value) => storage.setItem(key, JSON.stringify(value));

    const sessions = {
        list: () => read(KEYS.sessions, []),
        get: (id) => sessions.list().find((s) => s.id === id) ?? null,
        save(session) {
            const all = sessions.list();
            const now = new Date().toISOString();
            const idx = session.id ? all.findIndex((s) => s.id === session.id) : -1;
            const entry = {
                ...session,
                id: session.id ?? newId(),
                createdAt: idx >= 0 ? all[idx].createdAt : (session.createdAt ?? now),
                updatedAt: now,
                schemaVersion: 2,
            };
            if (idx >= 0) all[idx] = entry;
            else all.unshift(entry);
            write(KEYS.sessions, all);
            return entry;
        },
        remove(id) {
            write(KEYS.sessions, sessions.list().filter((s) => s.id !== id));
        },
        clear() {
            write(KEYS.sessions, []);
        },
    };

    const settings = {
        get: () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }),
        update(partial) {
            const next = { ...settings.get(), ...partial };
            write(KEYS.settings, next);
            return next;
        },
    };

    return {
        sessions,
        settings,
        nextReportNumber() {
            const year = new Date().getFullYear();
            const c = read(KEYS.counter, {});
            const seq = c.year === year ? c.seq + 1 : 1;
            write(KEYS.counter, { year, seq });
            return `RBA-${year}-${String(seq).padStart(3, "0")}`;
        },
        backup: {
            export: () => ({
                exportedAt: new Date().toISOString(),
                settings: settings.get(),
                sessions: sessions.list(),
            }),
            import(data, { merge = true } = {}) {
                const incoming = Array.isArray(data?.sessions) ? data.sessions : [];
                if (merge) {
                    const existing = sessions.list();
                    const ids = new Set(existing.map((s) => s.id));
                    write(KEYS.sessions, [...incoming.filter((s) => !ids.has(s.id)), ...existing]);
                } else {
                    write(KEYS.sessions, incoming);
                }
                if (data?.settings) settings.update(data.settings);
                return { imported: incoming.length };
            },
        },
    };
}

export const repository = createRepository();
