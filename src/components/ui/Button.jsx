import clsx from "clsx";

const VARIANTS = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3",
    ghost: "text-text-muted hover:text-text hover:bg-surface-2",
    danger: "bg-critical text-white hover:opacity-90",
};
const SIZES = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
};

export default function Button({ variant = "secondary", size = "md", icon: Icon, children, className, ...rest }) {
    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
                "disabled:opacity-45 disabled:pointer-events-none cursor-pointer select-none",
                VARIANTS[variant], SIZES[size], className
            )}
            {...rest}
        >
            {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2} />}
            {children}
        </button>
    );
}
