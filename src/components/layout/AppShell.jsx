import { Outlet } from "react-router-dom";
import { Disc3 } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-bg">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header mobile */}
                <header
                    className="lg:hidden sticky top-0 z-40 bg-surface-1 border-b border-border flex items-center justify-between px-4 h-14"
                    style={{ paddingTop: "env(safe-area-inset-top)" }}
                >
                    <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Disc3 size={17} className="text-white" />
                        </span>
                        <p className="text-sm font-bold text-text">
                            RotorBalance <span className="text-[10px] text-text-subtle font-semibold tracking-widest">AUTOMATIC</span>
                        </p>
                    </div>
                    <ThemeToggle />
                </header>

                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
            <BottomNav />
        </div>
    );
}
