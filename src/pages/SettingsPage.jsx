import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    Bell, Moon, Sun, DollarSign,
    Download, Upload, Globe, Save, RotateCcw
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [accentColor, setAccentColor] = useState(localStorage.getItem("accentColor") || "green");

    // Notification Settings
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        budgetAlerts: true,
        dailySummary: false
    });

    // Currency Settings
    const [currency, setCurrency] = useState(localStorage.getItem("currency") || "BDT");
    const [currencySymbol, setCurrencySymbol] = useState("৳");

    // Budget Settings
    const [monthlyBudget, setMonthlyBudget] = useState(localStorage.getItem("monthlyBudget") || "");

    // Language
    const [language, setLanguage] = useState(localStorage.getItem("language") || "en");

    useEffect(() => {
        // Set currency symbol
        const symbols = {
            BDT: "৳",
            USD: "$",
            EUR: "€",
            GBP: "£",
            INR: "₹"
        };
        setCurrencySymbol(symbols[currency] || "৳");
        localStorage.setItem("currency", currency);
    }, [currency]);

    const handleSaveSettings = () => {
        console.log("Accent Color:", accentColor);
        console.log("Monthly Budget:", monthlyBudget);
        console.log("Language:", language);
        console.log("Notifications:", notifications);

        localStorage.setItem("accentColor", accentColor);
        localStorage.setItem("monthlyBudget", monthlyBudget);
        localStorage.setItem("language", language);
        localStorage.setItem("notifications", JSON.stringify(notifications));

        toast.success("Settings saved successfully! ✅");
    };

    const handleResetSettings = () => {
        // ✅ Reset theme using toggleTheme if needed
        if (theme !== 'dark') {
            toggleTheme();
        }
        setAccentColor("green");
        setCurrency("BDT");
        setMonthlyBudget("");
        setLanguage("en");
        setNotifications({
            emailAlerts: true,
            budgetAlerts: true,
            dailySummary: false
        });

        localStorage.setItem("accentColor", "green");
        localStorage.setItem("currency", "BDT");
        localStorage.setItem("monthlyBudget", "");
        localStorage.setItem("language", "en");
        localStorage.setItem("notifications", JSON.stringify({
            emailAlerts: true,
            budgetAlerts: true,
            dailySummary: false
        }));

        toast.success("Settings reset to default! ✅");
    };

    const exportData = () => {
        const data = {
            user: user,
            settings: {
                theme,
                accentColor,
                currency,
                notifications,
                monthlyBudget,
                language
            },
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expense_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success("Data exported successfully! 📥");
    };

    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings) {
                    // ✅ Theme change using toggleTheme if needed
                    if (data.settings.theme && data.settings.theme !== theme) {
                        toggleTheme();
                    }
                    setAccentColor(data.settings.accentColor || "green");
                    setCurrency(data.settings.currency || "BDT");
                    setMonthlyBudget(data.settings.monthlyBudget || "");
                    setLanguage(data.settings.language || "en");
                    setNotifications(data.settings.notifications || notifications);
                    toast.success("Settings imported successfully! 📤");
                }
            } catch {
                toast.error("Invalid backup file");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="app-shell">
            <Navbar />
            <Toaster position="top-right" />

            <div className="app-container-narrow">

                {/* Header */}
                <div className="app-title-row">
                    <button
                        onClick={() => navigate(-1)}
                        className="app-back-button"
                    >
                        ←
                    </button>
                    <h1 className="app-title">Settings</h1>
                </div>

                <div className="space-y-5 sm:space-y-6">

                    {/* Theme Settings */}
                    <div className="app-card p-5 sm:p-6">
                        <h3 className="app-section-title mb-4">
                            <Moon size={20} /> Appearance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => theme !== 'dark' && toggleTheme()}
                                    className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base ${theme === "dark"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                        }`}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                                <button
                                    onClick={() => theme !== 'light' && toggleTheme()}
                                    className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base ${theme === "light"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                        }`}
                                >
                                    <Sun size={16} /> Light
                                </button>
                            </div>

                            {/* Accent Color */}
                            <div>
                                <label className="block text-sm sm:text-base text-gray-400 mb-2">Accent Color</label>
                                <div className="flex gap-3">
                                    {["green", "blue", "purple", "red", "orange"].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setAccentColor(color);
                                                localStorage.setItem("accentColor", color);
                                                // TODO: Apply accent color to app
                                            }}
                                            className={`w-8 h-8 rounded-full transition ${accentColor === color ? "ring-2 ring-white scale-110" : ""
                                                }`}
                                            style={{
                                                backgroundColor: color === "green" ? "#10b981" :
                                                    color === "blue" ? "#3b82f6" :
                                                        color === "purple" ? "#8b5cf6" :
                                                            color === "red" ? "#ef4444" : "#f97316"
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="app-card p-5 sm:p-6">
                        <h3 className="app-section-title mb-4">
                            <Bell size={20} /> Notifications
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm sm:text-base text-gray-300">Email Alerts</span>
                                <button
                                    onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                                    className={`w-12 h-6 rounded-full transition ${notifications.emailAlerts ? "bg-blue-600" : "bg-gray-700"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.emailAlerts ? "translate-x-6" : "translate-x-1"
                                        }`} />
                                </button>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm sm:text-base text-gray-300">Budget Alerts</span>
                                <button
                                    onClick={() => setNotifications({ ...notifications, budgetAlerts: !notifications.budgetAlerts })}
                                    className={`w-12 h-6 rounded-full transition ${notifications.budgetAlerts ? "bg-blue-600" : "bg-gray-700"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.budgetAlerts ? "translate-x-6" : "translate-x-1"
                                        }`} />
                                </button>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm sm:text-base text-gray-300">Daily Summary Email</span>
                                <button
                                    onClick={() => setNotifications({ ...notifications, dailySummary: !notifications.dailySummary })}
                                    className={`w-12 h-6 rounded-full transition ${notifications.dailySummary ? "bg-blue-600" : "bg-gray-700"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.dailySummary ? "translate-x-6" : "translate-x-1"
                                        }`} />
                                </button>
                            </label>
                        </div>
                    </div>

                    {/* Currency & Budget */}
                    <div className="app-card p-5 sm:p-6">
                        <h3 className="app-section-title mb-4">
                            <DollarSign size={20} /> Currency & Budget
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm sm:text-base text-gray-400 mb-2">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="app-select"
                                >
                                    <option value="BDT">🇧🇩 Bangladeshi Taka (৳)</option>
                                    <option value="USD">🇺🇸 US Dollar ($)</option>
                                    <option value="EUR">🇪🇺 Euro (€)</option>
                                    <option value="GBP">🇬🇧 British Pound (£)</option>
                                    <option value="INR">🇮🇳 Indian Rupee (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm sm:text-base text-gray-400 mb-2">Monthly Budget Limit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">
                                        {currencySymbol}
                                    </span>
                                    <input
                                        type="number"
                                        value={monthlyBudget}
                                        onChange={(e) => setMonthlyBudget(e.target.value)}
                                        placeholder="Enter amount"
                                        className="app-field pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="app-card p-5 sm:p-6">
                        <h3 className="app-section-title mb-4">
                            <Globe size={20} /> Language
                        </h3>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="app-select"
                        >
                            <option value="en">English</option>
                            <option value="bn">বাংলা (Coming Soon)</option>
                        </select>
                    </div>

                    {/* Data Management */}
                    <div className="app-card p-5 sm:p-6">
                        <h3 className="app-section-title mb-4">
                            <Download size={20} /> Data Management
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={exportData}
                                className="flex-1 app-primary-button py-2.5 flex items-center justify-center gap-2 text-sm"
                            >
                                <Download size={16} /> Export
                            </button>
                            <label className="flex-1 cursor-pointer">
                                <div className="app-secondary-button py-2.5 flex items-center justify-center gap-2 text-sm">
                                    <Upload size={16} /> Import
                                </div>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importData}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSaveSettings}
                            className="flex-1 app-primary-button py-3 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Save size={18} /> Save All Settings
                        </button>
                        <button
                            onClick={handleResetSettings}
                            className="flex-1 app-secondary-button py-3 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <RotateCcw size={18} /> Reset to Default
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
