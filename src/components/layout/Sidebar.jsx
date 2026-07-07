import { NavLink } from "react-router-dom";
import { LayoutDashboard, Scale, History, Settings, Disc3 } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "./ThemeToggle.jsx";

export const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/balanceamento", label: "Balanceamento", icon: Scale },
    { to: "/historico", label: "Histórico", icon: History },
    { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-surface-1 border-r border-border">
            <div className="flex items-center gap-3 px-4 py-5">
                <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Disc3 size={20} className="text-white" />
                </span>
                <div className="leading-tight">
                    <p className="text-sm font-bold text-text">RotorBalance</p>
                    <p className="text-[10px] tracking-widest text-text-subtle font-semibold">AUTOMATIC</p>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 rounded-lg px-3 h-10 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-soft text-primary"
                                    : "text-text-muted hover:text-text hover:bg-surface-2"
                            )
                        }
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <span className="text-[11px] text-text-subtle">RBA v2.0 · 3 pontos</span>
                <ThemeToggle />
            </div>
        </aside>
    );
}
