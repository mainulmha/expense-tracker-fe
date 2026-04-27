import { useState, useEffect } from "react";
import expenseAPI from "../services/expenseAPI";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "../utils/exportToExcel";
import { exportToPDF } from "../utils/exportToPDF";
import { printReport } from "../utils/printReport";
import { Pagination } from "../utils/pagination";

export default function ReportPage() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
    });
    const navigate = useNavigate();

    // Fetch transactions with pagination
    const fetchTransactions = async (page = 1) => {
        setLoading(true);
        try {
            let url = `/report/all?page=${page}&limit=10`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            if (selectedType !== "all") url += `&type=${selectedType}`;
            if (selectedCategory !== "all") url += `&category=${selectedCategory}`;

            const res = await expenseAPI.get(url);

            if (res.data?.success) {
                setTransactions(res.data.data || []);
                setFilteredTransactions(res.data.data || []);
                setPagination(res.data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    limit: 10,
                    hasNext: false,
                    hasPrev: false
                });

                // Update categories for filter dropdown
                if (page === 1) {
                    const allRes = await expenseAPI.get("/report/all?limit=1000");
                    const uniqueCategories = [...new Set(allRes.data?.data?.map(t => t.category) || [])];
                    setCategories(uniqueCategories);
                }
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and reset to page 1
    const applyFilters = () => {
        fetchTransactions(1);
    };

    // Reset all filters
    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setSelectedType("all");
        setSelectedCategory("all");
        fetchTransactions(1);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchTransactions(1);
    }, []);

    // Calculate totals from current page data
    const calculateTotals = () => {
        let income = 0, expense = 0, investment = 0;
        transactions.forEach(t => {
            if (t.type === "income") income += t.amount;
            else if (t.type === "expense") expense += t.amount;
            else if (t.type === "investment") investment += t.amount;
        });
        return { income, expense, investment, balance: income - expense - investment };
    };

    const totals = calculateTotals();
    const filters = { startDate, endDate, selectedType, selectedCategory };

    return (
        <div className="bg-[#020617] min-h-screen text-gray-200">
            <Navbar />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-xl">←</button>
                    <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-[#111827] rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs">Total Income</p>
                        <p className="text-green-400 text-xl font-bold">Tk {totals.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#111827] rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs">Total Expense</p>
                        <p className="text-red-400 text-xl font-bold">Tk {totals.expense.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#111827] rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs">Investment</p>
                        <p className="text-purple-400 text-xl font-bold">Tk {totals.investment.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#111827] rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs">Balance</p>
                        <p className="text-emerald-400 text-xl font-bold">Tk {totals.balance.toLocaleString()}</p>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <p>Showing {transactions.length} of {pagination.totalItems} transactions</p>
                    <p>Page {pagination.currentPage} of {pagination.totalPages}</p>
                </div>

                {/* Filters */}
                <div className="bg-[#111827] rounded-xl p-4 sm:p-6 mb-6">
                    <h3 className="text-gray-400 text-sm mb-4">🔍 Filters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[#1f2937] rounded-lg px-3 py-2 text-sm mt-1 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[#1f2937] rounded-lg px-3 py-2 text-sm mt-1 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full bg-[#1f2937] rounded-lg px-3 py-2 text-sm mt-1 text-white"
                            >
                                <option value="all">All Types</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                                <option value="investment">Investment</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-[#1f2937] rounded-lg px-3 py-2 text-sm mt-1 text-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                        <button onClick={applyFilters} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm">🔍 Apply Filters</button>
                        <button onClick={resetFilters} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">🔄 Reset</button>
                        <button onClick={() => exportToExcel(transactions)} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm">📊 Excel</button>
                        {/* <button onClick={() => exportToPDF(transactions, totals, filters)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm">📄 PDF</button> */}
                        <button onClick={() => printReport(transactions, totals, filters)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">🖨️ Print</button>
                    </div>
                </div>

                {/* Transaction Table */}
                <div className="bg-[#111827] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                        <h3 className="text-gray-400 text-sm">📋 Transaction History</h3>
                        <p className="text-gray-500 text-xs">{pagination.totalItems} total transactions</p>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No transactions found</div>
                        ) : (
                            <>
                                <table className="w-full">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400">Date</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400">Description</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400">Category</th>
                                            <th className="px-4 py-3 text-left text-xs text-gray-400">Type</th>
                                            <th className="px-4 py-3 text-right text-xs text-gray-400">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {transactions.map((t, idx) => (
                                            <tr key={idx} className="hover:bg-gray-800/50 transition">
                                                <td className="px-4 py-3 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-sm">{t.description}</td>
                                                <td className="px-4 py-3 text-sm">{t.category}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${t.type === "expense" ? "bg-red-500/20 text-red-400" :
                                                        t.type === "income" ? "bg-green-500/20 text-green-400" :
                                                            "bg-purple-500/20 text-purple-400"
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    <span className={t.type === "expense" ? "text-red-400" : t.type === "income" ? "text-green-400" : "text-purple-400"}>
                                                        {t.type === "expense" ? "-" : "+"} Tk {t.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Component */}
                                <Pagination pagination={pagination} onPageChange={handlePageChange} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
