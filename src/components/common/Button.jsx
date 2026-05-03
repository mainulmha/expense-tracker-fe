export default function Button({
    children,
    type = "button",
    variant = "primary",   // primary, secondary, danger
    size = "md",
    disabled = false,
    onClick,
    className = "",
    ...props
}) {
    const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.98]";

    const variants = {
        primary: "app-primary-button",
        secondary: "app-secondary-button",
        danger: "app-danger-button"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
