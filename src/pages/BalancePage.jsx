import { useEffect, useState } from "react";
import expenseAPI from "../services/expenseAPI";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
        <div className="app-shell">
            <Navbar />
            <div className="app-container">

                <div className="app-title-row">
                    <button onClick={() => navigate(-1)} className="app-back-button">←</button>
                    <h1 className="app-title">All Transactions</h1>
                </div>

                {loading ? (
                    <div className="app-card p-8 text-center text-gray-500">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="app-empty-state">No transactions found</div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((item) => (
                            <div key={item._id} className="app-card p-4 flex justify-between items-center">
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
