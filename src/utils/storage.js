/* ─── LocalStorage API for session history ───────────────────────────────── */

const STORAGE_KEY = "rba_sessions";
const MAX_SESSIONS = 50;

export function getSessions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveSession(session) {
    const sessions = getSessions();
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        ...session,
    };
    sessions.unshift(entry);
    if (sessions.length > MAX_SESSIONS) sessions.length = MAX_SESSIONS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return entry;
}

export function deleteSession(id) {
    const sessions = getSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return sessions;
}

export function clearAllSessions() {
    localStorage.removeItem(STORAGE_KEY);
}

/* ─── Theme persistence ──────────────────────────────────────────────────── */

const THEME_KEY = "rba_theme";

export function getTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || getSystemTheme();
    } catch {
        return "dark";
    }
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
}

function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
    }
    return "dark";
}
