import { useState, useRef, useEffect } from "react";
import { getCategoryIcon, formatCategoryName } from "../constants/categoryIcons";

export default function CustomSelect({ value, onChange, type, error, categories }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value);
    const dropdownRef = useRef(null);

    const currentCategories = categories[type] || categories.expense || [];

    useEffect(() => {
        setSelected(value);
    }, [value]);

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
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#1f2937] text-white rounded-lg px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-700'
                    } focus:border-green-500 focus:outline-none flex items-center justify-between hover:bg-[#2a3441] transition-colors`}
            >
                <div className="flex items-center gap-3">
                    {selectedIcon && selectedIcon.img ? (
                        <>
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: selectedIcon.bgColor || `${selectedIcon.color}20` }}
                            >
                                <img
                                    src={selectedIcon.img}
                                    alt="icon"
                                    className="w-4 h-4 object-contain"
                                />
                            </div>
                            <span className="text-white text-sm">{selectedIcon.label || formatCategoryName(selected)}</span>
                        </>
                    ) : (
                        <span className="text-gray-500 text-sm">Select category</span>
                    )}
                </div>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1f2937] border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    <div className="py-1">
                        {currentCategories.map(cat => {
                            const { img, bgColor, color, label } = getCategoryIcon(cat);
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleSelect(cat)}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 ${selected === cat ? 'bg-gray-700/50' : ''
                                        }`}
                                >
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: bgColor || `${color}20` }}
                                    >
                                        <img
                                            src={img}
                                            alt={cat}
                                            className="w-4 h-4 object-contain"
                                        />
                                    </div>
                                    <span className="text-white text-sm">{label}</span>
                                    {selected === cat && (
                                        <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
