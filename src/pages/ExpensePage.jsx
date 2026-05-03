import { useEffect, useState } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "../constants/categoryIcons";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Navbar from "../components/Navbar";


export default function ExpensePage() {
    const [expenses, setExpenses] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [filterType, setFilterType] = useState("expense"); // ডিফল্ট expense
    const navigate = useNavigate();

    // Fetches whenever the visible page or transaction type changes.
    useEffect(() => {
        fetchExpenses();
        fetchChartData();
    }, [currentPage, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

    // এক্সপেন্স লিস্ট ফেচ করা
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const url = filterType
                ? `/report/day-wise-report?page=${currentPage}&limit=10&type=${filterType}`
                : `/report/day-wise-report?page=${currentPage}&limit=10`;

            const res = await expenseAPI.get(url);
            setExpenses(res.data?.data || []);
            setPagination(res.data?.pagination || {});

            // টোটাল ক্যালকুলেশন
            let totalAmount = 0;
            res.data?.data?.forEach(group => {
                totalAmount += group.totalExpense || 0;
            });
            setTotal(totalAmount);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    // চার্ট ডাটা ফেচ করা
    const fetchChartData = async () => {
        try {
            const res = await expenseAPI.get("/report/monthly-trend");
            const data = res.data?.data || [];

            const formattedData = data.map(item => ({
                monthName: getMonthName(item._id?.month, item._id?.year),
                expense: item.expense || 0
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

    // ফিল্টার বাটন
    const filterTypes = [
        { value: "expense", label: "Expense", icon: "💰" },
        { value: "income", label: "Income", icon: "📈" },
        { value: "investment", label: "Investment", icon: "📊" }
    ];

    return (
        <div className="app-shell">
            <Navbar />
            <div className="app-container">

                {/* Header with Back Button */}
                <div className="app-title-row">
                    <button
                        onClick={() => navigate(-1)}
                        className="app-back-button"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="app-title">Expense</h1>
                        <p className="text-gray-400 text-sm">Total Expense: ৳{total.toLocaleString()}</p>
                    </div>
                </div>

                {/* 🔥 ফিল্টার বাটন */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterTypes.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterType(filter.value)}
                            className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterType === filter.value
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <span>{filter.icon}</span>
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>

                {/* 📊 বারচার্ট - উপরে */}
                <div className="app-card p-4 sm:p-6 mb-6">
                    <h3 className="text-gray-400 text-sm sm:text-base mb-4">Monthly Expense Trend</h3>
                    {chartData.length > 0 ? (
                        <div className="w-full h-[300px] sm:h-[350px]">
                            <BarChartComponent data={chartData} />
                        </div>
                    ) : (
                        <div className="app-empty-state">Loading chart...</div>
                    )}
                </div>

                {/* 📋 এক্সপেন্স লিস্ট - নিচে */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 text-sm sm:text-base">
                            Transaction History
                        </h3>
                        <p className="text-gray-500 text-xs">
                            Total: {pagination.totalGroups || 0} transactions
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
                        <div className="app-empty-state">
                            No expense transactions found
                        </div>
                    ) : (
                        <>
                            {/* ডে-ওয়াইজ লিস্ট */}
                            <div className="space-y-4">
                                {expenses.map((group, idx) => (
                                    <DayGroup key={idx} group={group} />
                                ))}
                            </div>

                            {/* পেজিনেশন */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition"
                                    >
                                        ← Previous
                                    </button>

                                    <span className="text-gray-300 text-sm">
                                        {currentPage} / {pagination.totalPages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// 📅 ডে গ্রুপ কম্পোনেন্ট
function DayGroup({ group }) {
    const [isOpen, setIsOpen] = useState(true);

    const date = new Date(group._id.year, group._id.month - 1, group._id.day);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="app-card overflow-hidden">
            {/* ডে হেডার */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-3 bg-gray-800/50 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                        <h3 className="font-semibold text-white">{formattedDate}</h3>
                        <p className="text-xs text-gray-500">{group.count} transactions</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-red-400 font-medium">৳{group.totalExpense.toLocaleString()}</p>
                    <span className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>

            {/* আইটেম লিস্ট */}
            {isOpen && (
                <div className="divide-y divide-gray-800">
                    {group.items.map((item) => (
                        <ExpenseItem key={item._id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

// 💰 একক এক্সপেন্স আইটেম
function ExpenseItem({ item }) {
    const { img, bgColor, color } = getCategoryIcon(item.category);
    const date = new Date(item.date).toLocaleDateString();

    return (
        <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-800/30 transition">
            <div className="flex items-center gap-3 flex-1">
                {/* আইকন */}
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bgColor || `${color}20` }}
                >
                    <img
                        src={img}
                        alt={item.category}
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    />
                </div>

                {/* বিবরণ */}
                <div className="flex-1">
                    <p className="text-white text-sm sm:text-base font-medium">
                        {item.description}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                        {item.category} • {date}
                    </p>
                </div>
            </div>

            {/* টাকা */}
            <p className="text-red-400 font-bold text-sm sm:text-base">
                ৳{item.amount.toLocaleString()}
            </p>
        </div>
    );
}

// 📊 বারচার্ট কম্পোনেন্ট
function BarChartComponent({ data }) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="monthName"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `৳${value.toLocaleString()}`}
                    />
                    <Tooltip
                        formatter={(value) => [`৳ ${value.toLocaleString()}`, "Expense"]}
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "10px",
                            color: "#fff"
                        }}
                    />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
