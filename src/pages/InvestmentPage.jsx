import { useEffect, useState } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";

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
        <div className="bg-[#020617] min-h-screen text-gray-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Investment</h1>
                        <p className="text-gray-400 text-sm">Total Investment: ৳{total.toLocaleString()}</p>
                    </div>
                </div>

                {/* Investment List */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : investments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No investment transactions found
                    </div>
                ) : (
                    <div className="space-y-3">
                        {investments.map((item) => (
                            <div key={item._id} className="bg-[#111827] rounded-xl p-4 flex justify-between items-center">
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
