import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { repository } from "../data/repository.js";

const ThemeContext = createContext(null);

const systemTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";

function apply(resolved) {
    document.documentElement.setAttribute("data-theme", resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#0f1117" : "#f6f7f9");
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        // Lê o valor BRUTO de rba_settings (settings.get() aplicaria o default
        // "system" e mascararia o tema legado da v1 em rba_theme).
        let stored = null;
        try {
            stored = JSON.parse(localStorage.getItem("rba_settings") ?? "{}").theme ?? null;
        } catch { /* ignora */ }
        const legacy = localStorage.getItem("rba_theme");
        const t = stored ?? legacy ?? "system";
        return ["light", "dark", "system"].includes(t) ? t : "system";
    });
    const resolved = theme === "system" ? systemTheme() : theme;

    useEffect(() => {
        apply(resolved);
    }, [resolved]);

    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: light)");
        const fn = () => apply(systemTheme());
        mq.addEventListener("change", fn);
        return () => mq.removeEventListener("change", fn);
    }, [theme]);

    const setTheme = useCallback((next) => {
        setThemeState(next);
        repository.settings.update({ theme: next });
        localStorage.setItem("rba_theme", next); // compat v1
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
