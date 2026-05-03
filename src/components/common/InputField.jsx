// components/common/InputField.jsx

export default function InputField({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    placeholder = "",
    options = null,
    className = "",
    disabled = false,
    required = false,
    leftIcon,
    rightIcon,
    ...props
}) {
    const baseInputClass = `app-field ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""}`;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block app-kicker">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            {/* Input / Select */}
            {type === "select" ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={baseInputClass}
                    {...props}
                >
                    {options}
                </select>
            ) : (
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={baseInputClass}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {rightIcon}
                        </span>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-red-400 text-sm flex items-center gap-1.5">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
}
