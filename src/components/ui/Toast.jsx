import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TONES = {
    success: "border-ok/40 text-ok",
    error: "border-critical/40 text-critical",
    info: "border-primary/40 text-primary",
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const toast = useCallback((msg, type = "success") => {
        const id = ++idRef.current;
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
                {toasts.map(({ id, msg, type }) => {
                    const Icon = ICONS[type] ?? Info;
                    return (
                        <div
                            key={id}
                            className={clsx(
                                "flex items-center gap-2 bg-surface-1 border rounded-lg px-4 py-2.5 shadow-lg text-sm text-text",
                                "[animation:toast-in_150ms_ease-out]", TONES[type] ?? TONES.info
                            )}
                        >
                            <Icon size={16} className="shrink-0" />
                            {msg}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
