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
    ...props
}) {
    const baseInputClass = `
        w-full bg-[#374151] text-white rounded-lg px-4 py-3 
        focus:outline-none focus:ring-2 focus:ring-green-500 
        border border-transparent focus:border-green-500
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed text-sm sm: text-lg
    `;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-300">
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
