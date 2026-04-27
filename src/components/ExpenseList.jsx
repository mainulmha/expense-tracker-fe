import { useState } from "react";
import { capitalize } from "../utils/helper";
import { getCategoryIcon } from "../constants/categoryIcons";
import { Pagination } from "../utils/pagination";


export default function ExpenseList({
    data,
    pagination,
    currentPage,
    onPageChange,
    loading
}) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // ✅ পেজ চেঞ্জ হ্যান্ডলার
    const handlePageChange = (newPage) => {
        if (onPageChange) {
            onPageChange(newPage);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-400">
                Loading report...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Empty State */}
            {data.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-[#0f172a] border border-gray-800 rounded-2xl">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-lg font-medium text-gray-400">
                        No transactions found
                    </p>
                </div>
            ) : (
                data.map((group, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div
                            key={index}
                            className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition"
                        >
                            {/* Header */}
                            <div
                                onClick={() => toggle(index)}
                                className="px-6 py-2 flex justify-between items-center cursor-pointer hover:bg-[#1e2937]"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg sm:text-2xl">📅</span>
                                    <div>
                                        <h3 className="text-sm sm:text-lg font-semibold text-gray-300">
                                            {group._id.day}{" "}
                                            {new Date(
                                                group._id.year,
                                                group._id.month - 1
                                            ).toLocaleString("default", {
                                                month: "long",
                                            })}{" "}
                                            {group._id.year}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-400">
                                            {group.count} transactions
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`text-sm sm:text-xl transition ${isOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    ▼
                                </div>
                            </div>

                            {/* Expand */}
                            {isOpen && (
                                <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">

                                    {/* Expense */}
                                    <Column
                                        title="Expense"
                                        color="red"
                                        icon="🔻"
                                        items={group.items.filter(i => i.type === "expense")}
                                    />

                                    {/* Investment */}
                                    <Column
                                        title="Investment"
                                        color="yellow"
                                        icon="📈"
                                        items={group.items.filter(i => i.type === "investment")}
                                    />

                                    {/* Income */}
                                    <Column
                                        title="Income"
                                        color="green"
                                        icon="💰"
                                        items={group.items.filter(i => i.type === "income")}
                                    />

                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* ✅ Pagination - এখন কাজ করবে */}
            {pagination?.totalPages > 1 && (
                <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}

/* 🔥 Reusable Column Component with Icons */
function Column({ title, color, icon, items }) {
    return (
        <div className={`bg-[#020617] rounded-xl p-4 border border-blue-950`}>
            <div className="flex items-center gap-2 mb-4">
                <span className={`text-${color}-500 text-lg`}>{icon}</span>
                <h4 className={`text-${color}-400 font-semibold text-sm sm:text-lg`}>
                    {title}
                </h4>
            </div>

            {items.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-lg italic">
                    No {title.toLowerCase()}
                </p>
            ) : (
                items.map((item) => {
                    const { img, bgColor, color: iconColor } = getCategoryIcon(item.category);

                    return (
                        <div
                            key={item._id}
                            className="flex justify-between items-center py-2 border-b border-gray-800 last:border-none gap-2"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {img && (
                                    <div
                                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: bgColor || `${iconColor}20` }}
                                    >
                                        <img
                                            src={img}
                                            alt={item.category}
                                            className="w-4 h-4 object-contain"
                                        />
                                    </div>
                                )}
                                <span className="text-gray-300 text-sm truncate">
                                    {capitalize(item.category)}
                                </span>
                            </div>

                            <span className={`text-${color}-400 text-sm font-medium flex-shrink-0`}>
                                ৳ {Number(item.amount).toLocaleString()}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
}
