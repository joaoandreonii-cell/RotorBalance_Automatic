export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-text">{title}</h1>
                {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
