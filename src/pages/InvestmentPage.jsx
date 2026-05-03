import { useEffect, useState } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function InvestmentPage() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const res = await expenseAPI.get("/report/investment");
            setInvestments(res.data?.data || []);
            const totalAmount = res.data?.data?.reduce((sum, item) => sum + item.amount, 0) || 0;
            setTotal(totalAmount);
        } catch (error) {
            console.error("Error fetching investments:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell">
            <Navbar />
            <div className="app-container">

                {/* Header */}
                <div className="app-title-row">
                    <button
                        onClick={() => navigate(-1)}
                        className="app-back-button"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="app-title">Investment</h1>
                        <p className="text-gray-400 text-sm">Total Investment: ৳{total.toLocaleString()}</p>
                    </div>
                </div>

                {/* Investment List */}
                {loading ? (
                    <div className="app-card p-8 text-center text-gray-500">Loading...</div>
                ) : investments.length === 0 ? (
                    <div className="app-empty-state">
                        No investment transactions found
                    </div>
                ) : (
                    <div className="space-y-3">
                        {investments.map((item) => (
                            <div key={item._id} className="app-card p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-gray-500">{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <p className="text-purple-400 font-bold">৳{item.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
