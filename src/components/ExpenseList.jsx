import { useState } from "react";
import { capitalize } from "../utils/helper";
import { getCategoryIcon } from "../constants/categoryIcons";
import { Pagination } from "../utils/pagination";

export default function ExpenseList({ data, pagination, onPageChange, loading }) {
    const [openIndex, setOpenIndex] = useState(0);

    // ✅ Filter State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2024, 2025, 2026];

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="font-sans">


            {/* --- LIST CONTENT --- */}
            <div className="p-4 sm:p-6 space-y-4">
                {data.length === 0 ? (
                    <div className="app-empty-state">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No Records Found</p>
                    </div>
                ) : (
                    data.map((group, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className={`rounded-xl border transition-all duration-300 ${isOpen ? 'bg-[#0f172a] border-gray-700/50' : 'bg-[#111827]/40 border-gray-800/40'}`}>
                                <div onClick={() => setOpenIndex(isOpen ? null : index)} className="p-5 flex justify-between items-center cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold border ${isOpen ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                            <span className="text-sm leading-none">{group._id.day}</span>
                                            <span className="text-[10px] uppercase mt-1 opacity-80">
                                                {new Date(group._id.year, group._id.month - 1).toLocaleString("default", { month: "short" })}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold text-gray-100 tracking-tight">
                                                {new Date(group._id.year, group._id.month - 1, group._id.day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h3>
                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{group.count} Items Today</p>
                                        </div>
                                    </div>
                                    <div className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="px-5 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <Section title="Income" type="income" items={group.items.filter(i => i.type === "income")} />
                                        <Section title="Expense" type="expense" items={group.items.filter(i => i.type === "expense")} />
                                        <Section title="Investment" type="investment" items={group.items.filter(i => i.type === "investment")} />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Filters Section - Compact Layout */}
            <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-2 mb-5">
                    <Search size={14} className="text-gray-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quick Filters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Start Date", type: "date", value: startDate, setter: setStartDate },
                        { label: "End Date", type: "date", value: endDate, setter: setEndDate }
                    ].map((field, idx) => (
                        <div key={idx}>
                            <label className="text-[9px] uppercase text-gray-600 font-black ml-1 tracking-tighter">{field.label}</label>
                            <input type={field.type} value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 focus:border-blue-500/50 outline-none mt-1" />
                        </div>
                    ))}
                    <div>
                        <label className="text-[9px] uppercase text-gray-600 font-black ml-1 tracking-tighter">Transaction Type</label>
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 focus:border-blue-500/50 outline-none mt-1">
                            <option value="all">All Types</option>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="investment">Investment</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] uppercase text-gray-600 font-black ml-1 tracking-tighter">Category</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 focus:border-blue-500/50 outline-none mt-1">
                            <option value="all">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-800/40">
                    <button onClick={applyFilters} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Apply</button>
                    <button onClick={resetFilters} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Reset</button>
                    <div className="ml-auto flex gap-2">
                        <button onClick={() => exportToExcel(transactions)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"><FileSpreadsheet size={16} /></button>
                        <button onClick={() => printReport(transactions, totals, filters)} className="p-2 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 hover:text-white transition-all"><Printer size={16} /></button>
                    </div>
                </div>
            </div>

            {pagination?.totalPages > 1 && (
                <div className="pb-8 flex justify-center"><Pagination pagination={pagination} onPageChange={onPageChange} /></div>
            )}
        </div>
    );
}

function Section({ title, type, items }) {
    const colors = {
        income: "text-emerald-400 border-emerald-500/10 bg-emerald-500/[0.03]",
        expense: "text-red-400 border-red-500/10 bg-red-500/[0.03]",
        investment: "text-purple-400 border-purple-500/10 bg-purple-500/[0.03]"
    };

    return (
        <div className={`rounded-xl border p-5 ${colors[type]}`}>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-bold">{items.length}</span>
            </div>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-[11px] text-gray-600 font-medium py-2 italic tracking-tight">Empty</p>
                ) : (
                    items.map((item) => {
                        const { img, bgColor, color } = getCategoryIcon(item.category);
                        return (
                            <div key={item._id} className="flex justify-between items-center group/item">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/10" style={{ backgroundColor: bgColor || `${color}20` }}>
                                        {img ? <img src={img} alt="" className="w-5 h-5 object-contain" /> : <span className="text-xs">📁</span>}
                                    </div>
                                    <div className="truncate text-left">
                                        <p className="text-[13px] font-bold text-gray-200 truncate leading-tight">{capitalize(item.category)}</p>
                                        <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{item.description || '...'}</p>
                                    </div>
                                </div>
                                <p className="text-[13px] font-black text-gray-100 ml-2">৳{item.amount.toLocaleString()}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
