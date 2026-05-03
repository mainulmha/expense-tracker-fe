import { useEffect, useState, useCallback } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { capitalize } from "../utils/helper";
import { Pagination } from "../utils/pagination";
import { getCategoryIcon } from "../constants/categoryIcons";
import PieChartComponent from "../components/charts/PieChartComponent";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AnalyticsPage() {
    const [expenses, setExpenses] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/report/day-wise-report?page=${currentPage}&limit=10`;
            if (activeTab !== "overview") url += `&type=${activeTab}`;

            const res = await expenseAPI.get(url);
            setExpenses(res.data?.data || []);
            setPagination(res.data?.pagination || {});

            let totalAmount = 0;
            res.data?.data?.forEach(group => {
                if (activeTab === "expense") totalAmount += group.totalExpense || 0;
                else if (activeTab === "income") totalAmount += group.totalIncome || 0;
                else if (activeTab === "investment") totalAmount += group.totalInvestment || 0;
                else totalAmount += (group.totalExpense || 0) + (group.totalIncome || 0) + (group.totalInvestment || 0);
            });
            setTotal(totalAmount);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [currentPage, activeTab]);

    const fetchChartData = useCallback(async () => {
        try {
            const res = await expenseAPI.get("/report/monthly-trend");
            const data = res.data?.data || [];
            setChartData(data.map(item => ({
                monthName: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][item._id?.month - 1]}`,
                expense: item.expense || 0,
                income: item.income || 0,
                investment: item.investment || 0
            })));
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => { fetchData(); fetchChartData(); }, [fetchData, fetchChartData]);

    // ✅ Style Helper: Dynamic classes Tailwind-e issue kore, tai fixed mapping use kora hoyeche
    const getTabStyles = (id) => {
        if (activeTab !== id) return "text-gray-500 hover:text-gray-300 bg-transparent";
        switch (id) {
            case 'expense': return "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
            case 'income': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
            case 'investment': return "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
            default: return "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
        }
    };


    return (
        <div className="app-shell">
            <Navbar />

            <main className="app-container space-y-6">

                {/* --- TOP HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="app-back-button group">
                            <svg className="text-gray-400 group-hover:text-white transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div>
                            <h1 className="app-title capitalize">
                                {activeTab}
                            </h1>
                            <p className="text-[11px] font-black uppercase text-gray-500 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Total Period: <span className="text-gray-300">৳{total.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>

                    {/* --- NAVIGATION TABS --- */}
                    <div className="flex bg-[#111827] p-1 rounded-xl border border-gray-800/50 backdrop-blur-xl overflow-x-auto no-scrollbar">
                        {['overview', 'expense', 'income', 'investment'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${getTabStyles(tab)}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CHARTS SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className={`${activeTab === 'overview' ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-3' : 'lg:col-span-5 grid grid-cols-1'} gap-6`}>
                        {activeTab === 'overview' ? (
                            ['expense', 'income', 'investment'].map(type => (
                                <div key={type} className="app-card p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{type} Distribution</h4>
                                    <PieChartComponent data={expenses.flatMap(g => g.items)} type={type} />
                                </div>
                            ))
                        ) : (
                            <div className="app-card p-6">
                                <PieChartComponent data={expenses.flatMap(g => g.items)} type={activeTab} />
                            </div>
                        )}
                    </div>

                    {activeTab !== 'overview' && (
                        <div className="lg:col-span-7 app-card p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Performance Trend</h3>
                                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Monthly View</div>
                            </div>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="0" stroke="#1f2937" vertical={false} />
                                        <XAxis dataKey="monthName" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                                        />
                                        <Bar dataKey={activeTab} fill={activeTab === 'expense' ? '#ef4444' : activeTab === 'income' ? '#10b981' : '#a855f7'} radius={[8, 8, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                <Footer />
            </main>
        </div>
    );
}

