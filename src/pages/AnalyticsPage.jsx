import { useEffect, useState } from "react";

import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";



import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { capitalize } from "../utils/helper";
import { Pagination } from "../utils/pagination";
import { getCategoryIcon } from "../constants/categoryIcons";

import PieChartComponent from "../components/charts/PieChartComponent";
import Navbar from "../components/Navbar";

export default function AnalyticsPage() {
    const [expenses, setExpenses] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();

    // ট্যাব চেঞ্জ হলে পেজ রিসেট
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchData();
        fetchChartData();
    }, [currentPage, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `/report/day-wise-report?page=${currentPage}&limit=10`;
            if (activeTab !== "overview") {
                url += `&type=${activeTab}`;
            }

            const res = await expenseAPI.get(url);
            setExpenses(res.data?.data || []);
            setPagination(res.data?.pagination || {});

            let totalAmount = 0;
            res.data?.data?.forEach(group => {
                if (activeTab === "expense") totalAmount += group.totalExpense || 0;
                else if (activeTab === "income") totalAmount += group.totalIncome || 0;
                else if (activeTab === "investment") totalAmount += group.totalInvestment || 0;
                else {
                    totalAmount += (group.totalExpense || 0) + (group.totalIncome || 0) + (group.totalInvestment || 0);
                }
            });
            setTotal(totalAmount);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const res = await expenseAPI.get("/report/monthly-trend");
            const data = res.data?.data || [];

            const formattedData = data.map(item => ({
                monthName: getMonthName(item._id?.month, item._id?.year),
                expense: item.expense || 0,
                income: item.income || 0,
                investment: item.investment || 0
            }));

            setChartData(formattedData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    };

    const getMonthName = (month, year) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[month - 1]} ${year}`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
            setCurrentPage(newPage);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "expense", label: "Expense", icon: "💰" },
        { id: "income", label: "Income", icon: "📈" },
        { id: "investment", label: "Investment", icon: "🏦" }
    ];

    // সব ট্রানজেকশন একত্রিত করা (PieChart এর জন্য)
    const allTransactions = [];
    expenses.forEach(group => {
        group.items.forEach(item => {
            allTransactions.push(item);
        });
    });

    // ট্যাব অনুযায়ী চার্টের রং এবং টাইটেল
    const getTabColor = () => {
        switch (activeTab) {
            case "expense": return "text-red-400";
            case "income": return "text-green-400";
            case "investment": return "text-purple-400";
            default: return "text-gray-400";
        }
    };

    const getTabIcon = () => {
        switch (activeTab) {
            case "expense": return "💰";
            case "income": return "📈";
            case "investment": return "📊";
            default: return "📋";
        }
    };

    const getBarColor = () => {
        switch (activeTab) {
            case "expense": return "#ef4444";
            case "income": return "#22c55e";
            case "investment": return "#a855f7";
            default: return "#6b7280";
        }
    };

    const getBarDataKey = () => {
        if (activeTab === "overview") return null;
        return activeTab;
    };

    return (
        <div className="bg-[#020617] min-h-screen text-gray-200">
            <Navbar />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
                        <p className="text-gray-400 text-sm">
                            {activeTab === "overview" ? "All Transactions" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analytics`}
                            : ৳{total.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Tab Buttons */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Charts Section - ট্যাব অনুযায়ী পরিবর্তন হবে */}
                {activeTab === "overview" ? (
                    // ✅ Overview: 3টি Pie Chart দেখাবে
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-[#111827] rounded-xl p-4 sm:p-5">
                            <PieChartComponent data={allTransactions} type="expense" />
                        </div>
                        <div className="bg-[#111827] rounded-xl p-4 sm:p-5">
                            <PieChartComponent data={allTransactions} type="income" />
                        </div>
                        <div className="bg-[#111827] rounded-xl p-4 sm:p-5">
                            <PieChartComponent data={allTransactions} type="investment" />
                        </div>
                    </div>
                ) : (
                    // ✅ Expense/Income/Investment: 1টি Pie Chart + 1টি Bar Chart
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                        {/* Pie Chart */}
                        <div className="bg-[#111827] rounded-xl p-4 sm:p-5">
                            <PieChartComponent data={allTransactions} type={activeTab} />
                        </div>

                        {/* Bar Chart - ট্যাব অনুযায়ী শুধু সেই ডাটা দেখাবে */}
                        <div className="bg-[#111827] rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">{getTabIcon()}</span>
                                <h3 className={`text-sm sm:text-base font-medium ${getTabColor()}`}>
                                    Monthly {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Trend
                                </h3>
                            </div>
                            {chartData.length > 0 ? (
                                <div className="w-full h-[280px] sm:h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis
                                                dataKey="monthName"
                                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={70}
                                                interval={0}
                                            />
                                            <YAxis
                                                tick={{ fill: '#9ca3af' }}
                                                tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip
                                                formatter={(value) => [`৳ ${value.toLocaleString()}`, activeTab]}
                                                contentStyle={{
                                                    backgroundColor: "#1f2937",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    color: "#fff"
                                                }}
                                            />
                                            <Bar
                                                dataKey={activeTab}
                                                name={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                                fill={getBarColor()}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">Loading chart...</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Transaction List Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 text-sm sm:text-base">
                            Transaction History
                        </h3>
                        <p className="text-gray-500 text-xs">
                            Page {currentPage} of {pagination.totalPages || 1} • Total: {pagination.totalGroups || 0} transactions
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-[#111827] rounded-xl p-4 h-16"></div>
                                ))}
                            </div>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-[#111827] rounded-xl">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-lg font-medium">No transactions found</p>
                            <p className="text-sm mt-1">Try changing filter or add new transaction</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {expenses.map((group, idx) => (
                                    <DayGroup key={idx} group={group} activeTab={activeTab} />
                                ))}
                            </div>

                            {/* Pagination Component */}
                            {pagination.totalPages > 1 && (
                                <Pagination pagination={pagination} onPageChange={handlePageChange} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Day Group Component
function DayGroup({ group, activeTab }) {
    const [isOpen, setIsOpen] = useState(false);

    const date = new Date(group._id.year, group._id.month - 1, group._id.day);

    const year = group._id.year;
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNumber = group._id.day;

    const getTotalAmount = () => {
        if (activeTab === "expense") return group.totalExpense || 0;
        if (activeTab === "income") return group.totalIncome || 0;
        if (activeTab === "investment") return group.totalInvestment || 0;
        return (group.totalExpense || 0) + (group.totalIncome || 0) + (group.totalInvestment || 0);
    };

    const getColor = () => {
        if (activeTab === "expense") return "text-red-400";
        if (activeTab === "income") return "text-green-400";
        if (activeTab === "investment") return "text-purple-400";
        return "text-gray-400";
    };

    const filteredItems = () => {
        if (activeTab === "overview") return group.items;
        return group.items.filter(item => item.type === activeTab);
    };

    if (filteredItems().length === 0) return null;

    return (
        <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-800">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-3 bg-gray-800/50 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">{year}</div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">
                            {monthName} {dayNumber}
                        </h3>
                        <p className="text-xs text-gray-500">{weekday}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className={`font-medium ${getColor()}`}>
                            ৳{getTotalAmount().toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                            {filteredItems().length} transactions
                        </p>
                    </div>
                    <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="divide-y divide-gray-800">
                    {filteredItems().map((item) => (
                        <TransactionItem key={item._id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Transaction Item Component
function TransactionItem({ item }) {
    const { img, bgColor, color } = getCategoryIcon(item.category);
    const date = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const getAmountColor = () => {
        if (item.type === "expense") return "text-red-400";
        if (item.type === "income") return "text-green-400";
        return "text-purple-400";
    };

    const getSign = () => {
        if (item.type === "expense") return "-";
        if (item.type === "income") return "+";
        return "";
    };

    return (
        <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-800/30 transition">
            <div className="flex items-center gap-3 flex-1">
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bgColor || `${color}20` }}
                >
                    <img src={img} alt={item.category} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                </div>

                <div className="flex-1">
                    <p className="text-white text-sm sm:text-base font-medium">{item.description}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{capitalize(item.category)} . {date}</p>
                </div>
            </div>

            <p className={`font-bold text-sm sm:text-base ${getAmountColor()}`}>
                {getSign()} ৳{item.amount.toLocaleString()}
            </p>
        </div>
    );
}
