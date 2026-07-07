import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { NAV_ITEMS } from "./Sidebar.jsx";

export default function BottomNav() {
    return (
        <nav
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-1 border-t border-border flex"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        clsx(
                            "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                            isActive ? "text-primary" : "text-text-subtle"
                        )
                    }
                >
                    <Icon size={19} />
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}
