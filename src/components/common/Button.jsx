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
    const baseStyles = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center text-sm";

    const variants = {
        primary: "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-600/70",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
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