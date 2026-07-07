export default function EmptyState({ icon: Icon, title, text, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            {Icon && (
                <span className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-text-muted" />
                </span>
            )}
            <p className="text-sm font-semibold text-text">{title}</p>
            {text && <p className="text-xs text-text-muted mt-1 max-w-sm">{text}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
