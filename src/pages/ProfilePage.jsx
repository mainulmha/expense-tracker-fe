import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { User, Mail, Calendar, Edit2, Save, X, Lock, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../services/expenseAPI";
import authAPI from "../services/authAPI";

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth(); // 👈 updateUser যোগ করুন
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.put("/update-profile", {
                name: formData.name,
                email: formData.email
            });

            if (response.data.success) {
                toast.success("Profile updated successfully! ✅");

                // ✅ Update localStorage
                const updatedUser = {
                    ...user,
                    name: response.data.user.name,
                    email: response.data.user.email
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                // ✅ Update AuthContext (if you have updateUser method)
                if (updateUser) {
                    updateUser(updatedUser);
                }

                // ✅ Update local state
                setFormData({
                    name: updatedUser.name,
                    email: updatedUser.email
                });

                // ✅ Just close edit mode, NO reload
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.post("/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                toast.success("Password changed successfully! ✅");
                setShowPasswordModal(false);
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            }
        } catch (error) {
            console.error("Password change error:", error);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : "January 2024";

    return (
        <div className="bg-[#020617] min-h-screen text-gray-200">
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
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Navbar />

            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        ←
                    </button>
                    {/* <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#111827] rounded-2xl p-6 text-center border border-gray-800">
                            {/* Avatar */}
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
                                <span className="text-white text-3xl font-bold">
                                    {formData.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            </div>

                            {/* Name - dynamically updated */}
                            <h2 className="text-xl font-semibold text-white">
                                {formData.name || user?.name || "User"}
                            </h2>

                            {/* Email - dynamically updated */}
                            <p className="text-gray-400 text-sm mt-1">
                                {formData.email || user?.email || "user@example.com"}
                            </p>

                            {/* Member Since */}
                            <div className="mt-4 pt-4 border-t border-gray-800">
                                <p className="text-gray-500 text-xs">
                                    Member since {memberSince}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Actions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Edit Profile Section */}
                        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition"
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                        <User size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Full Name</p>
                                            <p className="text-white">{formData.name || user?.name || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                        <Mail size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Email Address</p>
                                            <p className="text-white">{formData.email || user?.email || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                        <Calendar size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Member Since</p>
                                            <p className="text-white">{memberSince}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#1f2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-[#1f2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Security Section */}
                        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                            >
                                <Lock size={16} />
                                Change Password
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3 sm:px-4">
                    {/* ✅ এখানে custom-scroll ক্লাস যোগ করুন */}
                    <div className="bg-[#1f2937] w-full max-w-md mx-auto p-6 rounded-2xl relative custom-scroll max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full bg-[#0f172a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-[#0f172a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-[#0f172a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition mt-4"
                            >
                                {loading ? "Changing..." : "Change Password"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
