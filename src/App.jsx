import { useEffect, useState, useCallback } from "react";
import expenseAPI from "./services/expenseAPI";
import Navbar from "./components/Navbar";
import AddExpense from "./components/AddExpense";
import { Toaster } from "react-hot-toast";
import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import Footer from "./components/Footer";
import {
  LayoutDashboard, TrendingUp, PieChart as PieIcon, Plus, X,
  Search, FileSpreadsheet, Printer, ListFilter
} from 'lucide-react';
import Card from "./components/cards/Card";

// Chart Components
import AreaChartComponent from "./components/charts/AreaChartComponent";
import PieChartComponent from "./components/charts/PieChartComponent";

// Utils
import { Pagination } from "./utils/pagination";
import { exportToExcel } from "./utils/exportToExcel";
import { printReport } from "./utils/printReport";
import { getCategoryIcon } from "./constants/categoryIcons";

function App() {
  // --- States ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [balanceData, setBalanceData] = useState({ balance: 0, income: 0, expense: 0, investment: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // --- Filter States ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✅ Main Fetch Logic
  const fetchAllData = useCallback(async (page = 1, filterOverrides = {}) => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const activeStartDate = filterOverrides.startDate ?? startDate;
      const activeEndDate = filterOverrides.endDate ?? endDate;
      const activeType = filterOverrides.selectedType ?? selectedType;
      const activeCategory = filterOverrides.selectedCategory ?? selectedCategory;

      let reportUrl = `/report/all?page=${page}&limit=10`;
      if (activeStartDate) reportUrl += `&startDate=${activeStartDate}`;
      if (activeEndDate) reportUrl += `&endDate=${activeEndDate}`;
      if (activeType !== "all") reportUrl += `&type=${activeType}`;
      if (activeCategory !== "all") reportUrl += `&category=${activeCategory}`;

      const [reportRes, balanceRes, trendRes, catChartRes] = await Promise.all([
        expenseAPI.get(reportUrl),
        expenseAPI.get("/balance"),
        expenseAPI.get("/report/monthly-trend"),
        expenseAPI.get("/chart/category?type=expense")
      ]);

      // 1. Table & Pagination
      setTransactions(reportRes.data?.data || []);
      setPagination(reportRes.data?.pagination || {});

      // 2. Summary Cards
      const bal = balanceRes.data?.data || balanceRes.data || {};
      setBalanceData({
        balance: bal.balance ?? 0,
        income: bal.income ?? 0,
        expense: bal.expense ?? 0,
        investment: bal.investment ?? 0,
      });

      // 3. Area Chart (Trend)
      setMonthlyTrendData(trendRes.data?.data || []);

      // 4. Pie Chart (Category)
      const rawCatData = catChartRes.data?.data || catChartRes.data || [];
      setCategoryChartData(rawCatData.map(item => ({
        category: item._id || item.category,
        amount: item.total || item.amount || 0,
        type: "expense"
      })));

      // 5. Unique Categories for Filter Dropdown
      if (page === 1 && categories.length === 0) {
        const allRes = await expenseAPI.get("/report/all?limit=1000");
        const unique = [...new Set(allRes.data?.data?.map(t => t.category) || [])];
        setCategories(unique);
      }

    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated, startDate, endDate, selectedType, selectedCategory, categories.length]);

  useEffect(() => { if (isAuthenticated) fetchAllData(1); }, [isAuthenticated]);

  // --- Handlers ---
  const applyFilters = () => fetchAllData(1);
  const resetFilters = () => {
    setStartDate(""); setEndDate(""); setSelectedType("all"); setSelectedCategory("all");
    fetchAllData(1, { startDate: "", endDate: "", selectedType: "all", selectedCategory: "all" });
  };

  if (authLoading) return <div className="bg-[#020617] min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#020617] min-h-screen text-gray-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 pb-12">

        {/* SECTION 1: HEADER & CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={14} className="text-blue-500" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Overview</h2>
            </div>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">New Entry</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total Income" value={balanceData.income} type="income" icon="📈" />
            <Card title="Total Expense" value={balanceData.expense} type="expense" icon="🔻" />
            <Card title="Total Investment" value={balanceData.investment} type="investment" icon="🏦" />
            <Card title="Net Balance" value={balanceData.balance} type={balanceData.balance >= 0 ? "income" : "expense"} icon="⚖️" />
          </div>
        </div>

        {/* SECTION 2: CHARTS (Analytics) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loadingData ? (
            [1, 2].map(i => <div key={i} className="bg-[#111827] rounded-2xl h-[350px] animate-pulse border border-gray-800/50"></div>)
          ) : (
            <>
              {/* Category Spending */}
              <div className="bg-[#111827] rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expense Split</h3>
                    <p className="text-[11px] text-purple-400 font-bold mt-0.5">By Category</p>
                  </div>
                  <PieIcon size={14} className="text-gray-700" />
                </div>
                <div className="p-4 h-[300px] w-full">
                  <PieChartComponent data={categoryChartData} type="expense" />
                </div>
              </div>

              {/* Monthly Overview */}
              <div className="bg-[#111827] rounded-2xl border border-gray-800/50 shadow-xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monthly Trend</h3>
                    <p className="text-[11px] text-emerald-400 font-bold mt-0.5">Cash Flow Analysis</p>
                  </div>
                  <TrendingUp size={14} className="text-gray-700" />
                </div>
                <div className="p-4 h-[300px] w-full">
                  <AreaChartComponent data={monthlyTrendData} />
                </div>
              </div>
            </>
          )}
        </section>

        {/* SECTION 3: QUICK FILTERS */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800/50 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <Search size={14} className="text-gray-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quick Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[9px] uppercase text-gray-600 font-black ml-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 outline-none mt-1" />
            </div>
            <div>
              <label className="text-[9px] uppercase text-gray-600 font-black ml-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 outline-none mt-1" />
            </div>
            <div>
              <label className="text-[9px] uppercase text-gray-600 font-black ml-1">Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 outline-none mt-1">
                <option value="all">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-gray-600 font-black ml-1">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-[#0f172a] rounded-xl px-3 py-2 text-xs text-white border border-gray-800 outline-none mt-1">
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-800/40">
            <button onClick={applyFilters} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Apply Filters</button>
            <button onClick={resetFilters} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Reset</button>
            <div className="ml-auto flex gap-2">
              <button onClick={() => exportToExcel(transactions)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 transition-all"><FileSpreadsheet size={16} /></button>
              <button onClick={() => printReport(transactions, balanceData, { startDate, endDate, selectedType, selectedCategory })} className="p-2 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 hover:text-white transition-all"><Printer size={16} /></button>
            </div>
          </div>
        </div>

        {/* SECTION 4: GROUPED LOGS WITH ICONS (Mobile Responsive) */}
        <div className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl">
          <div className="px-5 py-3 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/10">
            <div className="flex items-center gap-2">
              <ListFilter size={14} className="text-gray-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Transaction Logs</h3>
            </div>
            <span className="text-[9px] font-black text-blue-500 bg-blue-500/5 px-2 py-1 rounded-md border border-blue-500/10 uppercase">
              {pagination.totalItems || 0} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="py-20 text-center text-[10px] font-black uppercase text-gray-600 tracking-widest animate-pulse">Loading...</div>
            ) : (
              <>
                <div className="w-full">
                  {Object.entries(
                    transactions.reduce((groups, t) => {
                      const date = new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                      if (!groups[date]) groups[date] = [];
                      groups[date].push(t);
                      return groups;
                    }, {})
                  ).map(([date, items]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="bg-[#0f172a]/80 px-4 sm:px-6 py-2 border-y border-gray-800/30 flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{date}</span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase">{items.length} TXNS</span>
                      </div>

                      {/* Transactions List */}
                      <div className="divide-y divide-gray-800/20">
                        {items.map((t, idx) => {
                          const { img, bgColor, color } = getCategoryIcon(t.category);

                          return (
                            <div key={idx} className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-white/[0.02] transition-all group">
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 overflow-hidden">

                                {/* 1. LEFT ICON */}
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
                                  style={{ backgroundColor: bgColor || `${color}15` }}
                                >
                                  {img ? (
                                    <img src={img} alt="" className="w-6 h-6 object-contain" />
                                  ) : (
                                    <span className="text-xs">📁</span>
                                  )}
                                </div>

                                {/* 2. TYPE & DESCRIPTION */}
                                <div className="overflow-hidden">
                                  {/* Category/Type - Always Visible */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-gray-200 tracking-tight">
                                      {t.category}
                                    </span>
                                    {/* Type Tag (Income/Expense) - Small Label */}
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-white/5 ${t.type === 'expense' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                      }`}>
                                      {t.type}
                                    </span>
                                  </div>

                                  {/* Description - Hidden on Mobile, Shown on SM screens up */}
                                  <p className="text-[11px] text-gray-500 mt-0.5 truncate font-medium hidden sm:block">
                                    {t.description || '...'}
                                  </p>
                                </div>
                              </div>

                              {/* 3. RIGHT AMOUNT */}
                              <div className="text-right shrink-0 ml-4">
                                <p className={`text-[13px] sm:text-sm font-black tracking-tight ${t.type === "expense" ? "text-red-400" : "text-emerald-400"
                                  }`}>
                                  {t.type === "expense" ? "-" : "+"}৳{t.amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {transactions.length === 0 && (
                  <div className="py-20 text-center text-[10px] font-black uppercase text-gray-600 tracking-widest">No transactions</div>
                )}

                <div className="p-4 flex justify-center border-t border-gray-800/30">
                  <Pagination pagination={pagination} onPageChange={(p) => fetchAllData(p)} />
                </div>
              </>
            )}
          </div>
        </div>

        <Footer />
      </main>

      {/* --- ADD MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-[#111827] w-full max-w-lg rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-white">Add Transaction</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <AddExpense refresh={() => fetchAllData(1)} onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={false} initialMode="login" onSuccess={() => fetchAllData(1)} />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
