import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
    useEffect(() => {
        if (!open) return;
        const fn = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/55 [animation:modal-fade_120ms_ease-out]"
            onClick={onClose}
        >
            <div
                className={clsx(
                    "w-full bg-surface-1 border border-border rounded-xl shadow-2xl [animation:modal-pop_140ms_ease-out]",
                    SIZES[size]
                )}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-text">{title}</h2>
                    <button className="text-text-muted hover:text-text cursor-pointer" onClick={onClose} aria-label="Fechar">
                        <X size={18} />
                    </button>
                </header>
                <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
                {footer && <footer className="flex justify-end gap-2 px-5 py-4 border-t border-border">{footer}</footer>}
            </div>
        </div>
    );
}
