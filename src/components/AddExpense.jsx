import { useState, useEffect } from "react";
import expenseAPI from "../services/expenseAPI";
import toast from "react-hot-toast";
import InputField from "./common/InputField";
import Button from "./common/Button";
import CustomSelect from "./CustomSelect";

const categories = {
    expense: ["food", "travel", "rent", "transport", "shopping", "medicine", "gold", "recharge", "internet bill", "dish bill", "other"],
    income: ["salary", "investment", "other"],
    investment: ["investment", "gold", "fdr", "dps", "share", "other"]
};

export default function AddExpense({ refresh, onClose }) {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        type: "expense",
        date: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const firstCategory = categories[formData.type]?.[0] || "";
        setFormData(prev => ({ ...prev, category: firstCategory }));
    }, [formData.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Invalid amount";
        if (!formData.category) newErrors.category = "Category is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            const response = await expenseAPI.post("/add", {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            if (response.data.success) {
                toast.success("Transaction Added! ✅");
                refresh?.();
                onClose?.();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Type Selection - Full width on mobile */}
                <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">
                        Transaction Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['expense', 'income', 'investment'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                                className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase transition-all border ${formData.type === t
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                    : 'bg-[#1f2937] border-transparent text-gray-500 hover:border-gray-700'
                                    }`}
                            >
                                {t === 'expense' ? '💰' : t === 'income' ? '📈' : '🏦'} {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div className="sm:col-span-1">
                    <InputField
                        label="Amount (Tk)"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.amount}
                        className="bg-[#1f2937] border-gray-700 focus:border-blue-500 rounded-xl"
                    />
                </div>

                {/* Date */}
                <div className="sm:col-span-1">
                    <InputField
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="bg-[#1f2937] border-gray-700 focus:border-blue-500 rounded-xl w-full"
                    />
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                    <CustomSelect
                        type={formData.type}
                        value={formData.category}
                        onChange={handleChange}
                        error={errors.category}
                        categories={categories}
                    />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                    <InputField
                        label="Description"
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What was this for?"
                        error={errors.description}
                        className="bg-[#1f2937] border-gray-700 focus:border-blue-500 rounded-xl"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-800">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-1/3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="w-full sm:w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 font-bold"
                >
                    {submitting ? "Processing..." : "Add Transaction"}
                </Button>
            </div>
        </form>
    );
}
