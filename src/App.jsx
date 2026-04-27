import { useEffect, useState, useCallback } from "react";

import expenseAPI from "./services/expenseAPI";

import Navbar from "./components/Navbar";
import Balance from "./components/Balance";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";

import PieChartComponent from "./components/charts/PieChartComponent";
import AreaChartComponent from "./components/charts/AreaChartComponent";

import { Toaster } from "react-hot-toast";
import Button from "./components/common/Button";
import { useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

function App() {
  const [data, setData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    investment: 0,
  });

  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // ✅ STARTUP: লগআউট অবস্থায় সব ফরগট পাসওয়ার্ড ডাটা ক্লিয়ার করুন
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !isAuthenticated) {
      localStorage.removeItem("forgotPasswordStep");
      localStorage.removeItem("forgotPasswordData");
      localStorage.removeItem("authModalMode");
      localStorage.setItem("authModalOpen", "false");
    }
  }, []);

  // ✅ পেজ রিফ্রেশে AuthModal state রিস্টোর করুন
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedModalOpen = localStorage.getItem("authModalOpen");
    const savedForgotStep = localStorage.getItem("forgotPasswordStep");

    // যদি লগইন করা থাকে, মোডাল দেখাবেন না
    if (token || isAuthenticated) {
      setShowAuthModal(false);
      return;
    }

    // লগআউট অবস্থায় ফরগট পাসওয়ার্ড ডাটা ক্লিয়ার করুন
    if (savedForgotStep) {
      localStorage.removeItem("forgotPasswordStep");
      localStorage.removeItem("forgotPasswordData");
    }

    // মোডাল দেখান (শুধু লগইন ফর্ম)
    if (savedModalOpen === "true") {
      setShowAuthModal(true);
      setAuthModalMode("login");
    } else {
      setShowAuthModal(true);
      setAuthModalMode("login");
    }
  }, [isAuthenticated]);

  // ✅ Show auth modal if not authenticated (first time)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowAuthModal(true);
        setAuthModalMode("login");
      }
    }
  }, [authLoading, isAuthenticated]);

  // 🔥 FETCH ALL DATA - Only if authenticated
  const fetchAllData = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;

    setLoadingData(true);
    setError(null);

    try {
      const [dayRes, catRes, trendRes, balanceRes] = await Promise.all([
        expenseAPI.get(`/report/day-wise-report?page=${page}&limit=5`),
        expenseAPI.get("/chart/category?type=expense"),
        expenseAPI.get("/report/monthly-trend"),
        expenseAPI.get("/balance"),
      ]);

      setData(dayRes.data?.data || []);
      setPagination(dayRes.data?.pagination || {});
      setCurrentPage(page);

      const rawCategoryData = catRes.data?.data || catRes.data || [];
      const formattedCategoryData = rawCategoryData.map(item => ({
        category: item._id || item.category,
        amount: item.total || item.amount || 0,
        type: "expense"
      }));
      setCategoryData(formattedCategoryData);

      setMonthlyTrendData(trendRes.data?.data || []);

      const bal = balanceRes.data?.data || balanceRes.data || {};
      setBalanceData({
        balance: bal.balance ?? 0,
        income: bal.income ?? 0,
        expense: bal.expense ?? 0,
        investment: bal.investment ?? 0,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  // 🔥 INITIAL LOAD
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData(1);
    }
  }, [fetchAllData, isAuthenticated]);

  // 🔥 REFRESH CURRENT PAGE AFTER ADD
  const refreshCurrentPage = () => {
    fetchAllData(currentPage);
  };

  // 🔥 ESC CLOSE MODAL
  useEffect(() => {
    if (!showForm) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") setShowForm(false);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showForm]);

  // ✅ Handle auth success
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setAuthModalMode("login");
    localStorage.removeItem("authModalOpen");
    localStorage.removeItem("authModalMode");
    localStorage.removeItem("forgotPasswordStep");
    localStorage.removeItem("forgotPasswordData");
    fetchAllData(1);
  };

  // ✅ Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    localStorage.setItem("authModalOpen", "false");
  };

  // ❌ Auth Loading UI
  if (authLoading) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="text-green-500 text-lg">Loading...</div>
      </div>
    );
  }

  // ❌ Error UI
  if (error) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-500/10 text-red-400 p-4 sm:p-6 rounded-xl text-center max-w-md w-full">
          <p className="mb-4 text-sm sm:text-base">⚠️ {error}</p>
          <button
            onClick={() => fetchAllData(1)}
            className="bg-red-500 hover:bg-red-600 px-5 sm:px-6 py-2 rounded-lg text-sm sm:text-base transition-all w-full sm:w-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen text-gray-200">
      <Navbar />

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-5 md:space-y-6">

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="w-full">
            <Balance data={balanceData} loading={loadingData} />
          </div>

          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto rounded-xl shadow-lg gap-2"
          >
            <span className="text-base sm:text-lg">+</span>
            <span>Add Expense</span>
          </Button>
        </div>

        {/* CHARTS SECTION */}
        {loadingData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-[#111827] rounded-2xl animate-pulse">
              <div className="h-[280px] sm:h-[320px] md:h-[350px]"></div>
            </div>
            <div className="bg-[#111827] rounded-2xl animate-pulse">
              <div className="h-[280px] sm:h-[320px] md:h-[350px]"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">

            {/* Pie Chart Card */}
            <div className="bg-[#111827] rounded-2xl shadow-lg overflow-hidden">
              <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2">
                <h3 className="text-sm sm:text-lg text-gray-500 flex items-center gap-2">
                  <span>📊</span>
                  <span>Category Spending</span>
                </h3>
              </div>
              <div className="px-2 sm:px-3 md:px-4 pb-3 sm:pb-4 md:pb-6">
                <div className="w-full h-[260px] sm:h-[300px] md:h-[340px]">
                  <PieChartComponent data={categoryData} type="expense" />
                </div>
              </div>
            </div>

            {/* Area Chart Card */}
            <div className="bg-[#111827] rounded-2xl shadow-lg overflow-hidden">
              <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2">
                <h3 className="text-sm sm:text-lg text-gray-500 flex items-center gap-2">
                  <span>📈</span>
                  <span>Monthly Overview</span>
                </h3>
              </div>
              <div className="px-2 sm:px-3 md:px-4 pb-3 sm:pb-4 md:pb-6">
                <div className="w-full h-[260px] sm:h-[300px] md:h-[340px]">
                  <AreaChartComponent data={monthlyTrendData} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* EXPENSE LIST SECTION */}
        <div className="bg-[#111827] rounded-2xl shadow-lg overflow-hidden">

          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-b border-gray-800 mb-2">
            <h3 className="text-sm sm:text-lg text-gray-500 flex items-center gap-2">
              <span>💰</span>
              <span>Recent Transactions</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <ExpenseList
              data={data}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={fetchAllData}
              loading={loadingData}
            />
          </div>

        </div>

      </div>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-3 sm:px-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1f2937] w-full max-w-md mx-auto p-4 sm:p-5 md:p-6 rounded-2xl max-h-[90vh] overflow-y-auto relative custom-scroll"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-sm sm:text-xl font-semibold">➕ Add New Transaction</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <AddExpense
              refresh={refreshCurrentPage}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px'
          },
        }}
      />
    </div>
  );
}

export default App;
