import { useEffect, useState } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";

export default function BalancePage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    const fetchAllTransactions = async () => {
        try {
            const res = await expenseAPI.get("/report/all");
            setTransactions(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#020617] min-h-screen text-gray-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">← Back</button>
                    <h1 className="text-2xl sm:text-3xl font-bold">All Transactions</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No transactions found</div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((item) => (
                            <div key={item._id} className="bg-[#111827] rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.category} • {item.type} • {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <p className={`font-bold ${item.type === 'income' ? 'text-green-400' : item.type === 'expense' ? 'text-red-400' : 'text-purple-400'}`}>
                                    {item.type === 'income' ? '+' : '-'} ৳{item.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
