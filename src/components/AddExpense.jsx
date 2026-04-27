import { useState, useEffect } from "react";
import expenseAPI from "../services/expenseAPI";
import toast from "react-hot-toast";
import InputField from "./common/InputField";
import Button from "./common/Button";
import CustomSelect from "./CustomSelect";

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

    const categories = {
        expense: ["food", "travel", "rent", "transport", "shopping", "medicine", "gold", "recharge", "internet bill", "dish bill", "other"],
        income: ["salary", "investment", "other"],
        investment: ["investment", "gold", "fdr", "dps", "share", "other"]
    };

    // ✅ Type পরিবর্তন হলে প্রথম ক্যাটাগরি সেট করা
    useEffect(() => {
        const firstCategory = categories[formData.type]?.[0] || "";
        setFormData(prev => ({
            ...prev,
            category: firstCategory
        }));
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

        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Please enter a valid amount";
        if (!formData.category) newErrors.category = "Please select a category";

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
                toast.success("Transaction Added Successfully! ✅");

                refresh?.();
                onClose?.();

                setFormData({
                    description: "",
                    amount: "",
                    category: categories.expense[0], // ✅ রিসেট করার সময়ও প্রথম ক্যাটাগরি
                    type: "expense",
                    date: new Date().toISOString().split('T')[0]
                });
                setErrors({});
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add transaction!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type */}
            <InputField
                label="Type"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleChange}
                className="text-sm"
                options={
                    <>
                        <option value="expense">💰 Expense</option>
                        <option value="income">📈 Income</option>
                        <option value="investment">📊 Investment</option>
                    </>
                }
            />

            {/* Description */}
            <InputField
                label="Description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                error={errors.description}
                required
            />

            {/* Amount */}
            <InputField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                error={errors.amount}
            />

            {/* Category - Custom Select with Icons */}
            <CustomSelect
                type={formData.type}
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                categories={categories}
            />

            {/* Date */}
            <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-6 justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                    Cancel
                </Button>

                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Transaction"}
                </Button>
            </div>
        </form>
    );
}
