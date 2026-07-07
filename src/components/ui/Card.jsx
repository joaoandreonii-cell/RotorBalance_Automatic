import clsx from "clsx";

export default function Card({ title, subtitle, actions, children, className }) {
    return (
        <section className={clsx("bg-surface-1 border border-border rounded-xl", className)}>
            {title && (
                <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-border">
                    <div>
                        <h2 className="text-sm font-semibold text-text">{title}</h2>
                        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
                    </div>
                    {actions}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}
