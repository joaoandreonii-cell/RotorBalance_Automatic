import clsx from "clsx";

export default function Input({ label, sub, suffix, error, className, ...rest }) {
    return (
        <label className={clsx("block", className)}>
            {label && (
                <span className="block text-xs font-medium text-text-muted mb-1.5">
                    {label}
                    {sub && <span className="text-text-subtle font-normal"> · {sub}</span>}
                </span>
            )}
            <span className="relative block">
                <input
                    className={clsx(
                        "w-full h-10 rounded-lg bg-surface-2 border px-3 text-sm text-text placeholder:text-text-subtle",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition-colors",
                        error ? "border-critical" : "border-border",
                        suffix && "pr-14"
                    )}
                    {...rest}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none">
                        {suffix}
                    </span>
                )}
            </span>
            {error && <span className="block text-xs text-critical mt-1">{error}</span>}
        </label>
    );
}
