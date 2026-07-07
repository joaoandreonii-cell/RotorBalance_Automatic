import clsx from "clsx";

export default function Select({ label, options, className, ...rest }) {
    return (
        <label className={clsx("block", className)}>
            {label && <span className="block text-xs font-medium text-text-muted mb-1.5">{label}</span>}
            <select
                className={clsx(
                    "w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text",
                    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition-colors cursor-pointer"
                )}
                {...rest}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </label>
    );
}
