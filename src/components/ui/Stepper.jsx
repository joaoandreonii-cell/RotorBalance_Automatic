import { Check } from "lucide-react";
import clsx from "clsx";

export default function Stepper({ steps, current, onSelect }) {
    return (
        <ol className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
            {steps.map(({ label }, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={label} className="flex items-center gap-1 shrink-0">
                        {i > 0 && <span className={clsx("w-5 h-px", done || active ? "bg-primary" : "bg-border-strong")} />}
                        <button
                            onClick={() => done && onSelect(i)}
                            disabled={!done && !active}
                            className={clsx(
                                "flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 text-[11px] font-medium transition-colors",
                                active && "bg-primary-soft text-primary",
                                done && "text-text-muted hover:text-text cursor-pointer",
                                !done && !active && "text-text-subtle"
                            )}
                        >
                            <span
                                className={clsx(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                    active && "bg-primary text-white",
                                    done && "bg-ok-soft text-ok",
                                    !done && !active && "bg-surface-3 text-text-subtle"
                                )}
                            >
                                {done ? <Check size={11} /> : i + 1}
                            </span>
                            {label}
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
