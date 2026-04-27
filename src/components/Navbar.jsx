import { useState } from "react";
import { User, Home, Settings, LogOut, BarChart3, LayoutDashboard, X, Menu, UserCircle } from 'lucide-react';
import AuthModal from "./auth/AuthModal";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { user, isAuthenticated, logout, loading } = useAuth();
    const isLoggedIn = isAuthenticated;

    const handleLogout = () => {
        logout();
        navigate('/');
        setOpenDropdown(false);
        setIsMobileMenuOpen(false);

        // ✅ নিশ্চিত করুন localStorage clean হচ্ছে
        localStorage.removeItem('forgotPasswordStep');
        localStorage.removeItem('forgotPasswordData');
        localStorage.removeItem('authModalMode');
        localStorage.removeItem('authModalOpen');
    };

    const handleAuthSuccess = (userData) => {
        setIsAuthModalOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setOpenDropdown(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
        { path: "/reports", label: "Reports", icon: <FileText size={20} /> }
    ];

    if (loading) {
        return (
            <nav className="px-3 sm:px-6 md:px-10 bg-[#020617] border-b border-gray-800 py-3 sticky top-0 z-50">
                <div className="flex justify-between items-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold flex items-center gap-2">
                        <span>💰</span>
                        <span>Spends</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="px-3 sm:px-6 md:px-10 bg-[#020617] border-b border-gray-800 py-3 sticky top-0 z-50">
                <div className="flex justify-between items-center">

                    {/* LEFT - Logo */}
                    <div
                        onClick={() => handleNavigation("/")}
                        className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    >
                        <span>💰</span>
                        <span className="hidden xs:inline">Spends</span>
                    </div>

                    {/* RIGHT - শুধু হ্যামবার্গার মেনু বাটন */}
                    <div className="flex items-center gap-3">
                        {/* হ্যামবার্গার মেনু বাটন - সবসময় দেখাবে */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* হ্যামবার্গার মেনু (স্লাইডার) */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="fixed top-0 right-0 h-full w-80 bg-[#0f172a] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">

                        {/* Menu Header - User Info */}
                        <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
                            {isLoggedIn ? (
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white text-lg font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    {/* User Details */}
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-base">
                                            {user?.name || "User"}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">
                                            {user?.email || "user@example.com"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                        <UserCircle size={40} className="text-white" />
                                    </div>
                                    <p className="text-white font-semibold">Guest User</p>
                                    <p className="text-gray-400 text-xs">Please sign in to continue</p>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all w-full"
                                    >
                                        Sign In / Sign Up
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-4">
                            {isLoggedIn && (
                                <>
                                    {/* Navigation Links */}
                                    <div className="px-4 mb-4">
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-3">Menu</p>
                                        {navLinks.map((link) => (
                                            <button
                                                key={link.path}
                                                onClick={() => handleNavigation(link.path)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${isActive(link.path)
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                {link.icon}
                                                <span className="text-sm font-medium">{link.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <hr className="border-gray-800 mx-4 my-2" />

                                    {/* Profile & Settings */}
                                    <div className="px-4">
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-3">Account</p>
                                        <button
                                            onClick={() => handleNavigation("/profile")}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-all mb-1"
                                        >
                                            <User size={20} />
                                            <span className="text-sm font-medium">Profile</span>
                                        </button>

                                        <button
                                            onClick={() => handleNavigation("/settings")}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-all mb-1"
                                        >
                                            <Settings size={20} />
                                            <span className="text-sm font-medium">Settings</span>
                                        </button>

                                        <hr className="border-gray-800 my-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-all"
                                        >
                                            <LogOut size={20} />
                                            <span className="text-sm font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
}
