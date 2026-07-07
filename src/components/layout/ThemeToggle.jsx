import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext.jsx";

export default function ThemeToggle() {
    const { resolved, setTheme } = useTheme();
    const dark = resolved === "dark";
    return (
        <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            title={dark ? "Modo claro" : "Modo escuro"}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
        >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
    );
}
