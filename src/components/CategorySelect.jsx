import { useState, useRef, useEffect } from "react";
import { getCategoryIcon, formatCategoryName } from "../constants/categoryIcons";

export default function CategorySelect({ value, onChange, type, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value);
    const dropdownRef = useRef(null);

    const categories = {
        expense: ["food", "travel", "rent", "transport", "shopping", "medicine", "gold", "recharge", "internet bill", "dish bill", "other"],
        income: ["salary", "investment", "other"],
        investment: ["investment", "gold", "fdr", "dps", "share", "other"]
    };

    const currentCategories = categories[type] || categories.expense;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (cat) => {
        setSelected(cat);
        onChange({ target: { name: "category", value: cat } });
        setIsOpen(false);
    };

    const selectedIcon = selected ? getCategoryIcon(selected) : null;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block app-kicker mb-2">
                Category
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`app-field flex items-center justify-between ${error ? 'border-red-500' : 'border-gray-700'}`}
            >
                <div className="flex items-center gap-3">
                    {selectedIcon ? (
                        <>
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: selectedIcon.bgColor }}
                            >
                                <img
                                    src={selectedIcon.img}
                                    alt="icon"
                                    className="w-3.5 h-3.5 object-contain"
                                />
                            </div>
                            <span>{formatCategoryName(selected)}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">Select category</span>
                    )}
                </div>
                <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#111827] border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {currentCategories.map(cat => {
                        const { img, bgColor, label } = getCategoryIcon(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleSelect(cat)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: bgColor }}
                                >
                                    <img
                                        src={img}
                                        alt={cat}
                                        className="w-4 h-4 object-contain"
                                    />
                                </div>
                                <span className="text-white text-sm">{label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
