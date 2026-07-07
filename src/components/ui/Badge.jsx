import clsx from "clsx";

const TONES = {
    neutral: "bg-surface-3 text-text-muted",
    primary: "bg-primary-soft text-primary",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    critical: "bg-critical-soft text-critical",
};

export default function Badge({ tone = "neutral", children }) {
    return (
        <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", TONES[tone])}>
            {children}
        </span>
    );
}
