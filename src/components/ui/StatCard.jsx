import clsx from "clsx";

const TONES = {
    neutral: "text-text",
    primary: "text-primary",
    ok: "text-ok",
    warn: "text-warn",
    critical: "text-critical",
};

export default function StatCard({ label, value, sub, icon: Icon, tone = "neutral" }) {
    return (
        <div className="bg-surface-1 border border-border rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-text-muted leading-tight">{label}</p>
                {Icon && (
                    <span className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                        <Icon size={16} className={clsx(TONES[tone])} />
                    </span>
                )}
            </div>
            <p className={clsx("text-2xl font-bold leading-none", TONES[tone])}>{value}</p>
            {sub && <p className="text-xs text-text-subtle">{sub}</p>}
        </div>
    );
}
