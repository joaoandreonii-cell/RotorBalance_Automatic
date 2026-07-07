import clsx from "clsx";

export default function SegmentedControl({ value, onChange, options }) {
    return (
        <div className="inline-flex bg-surface-2 border border-border rounded-lg p-1 gap-1">
            {options.map(({ value: v, label, icon: Icon }) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium transition-colors cursor-pointer",
                        v === value ? "bg-primary-soft text-primary" : "text-text-muted hover:text-text"
                    )}
                >
                    {Icon && <Icon size={14} />}
                    {label}
                </button>
            ))}
        </div>
    );
}
