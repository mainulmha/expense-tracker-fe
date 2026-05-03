import { useState, useEffect } from "react";
import { User, Settings, LogOut, BarChart3, LayoutDashboard, X, Menu, FileText, ChevronRight } from 'lucide-react';
import AuthModal from "./auth/AuthModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { user, isAuthenticated, logout, loading } = useAuth();

    // Scroll effect for Navbar
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { path: "/analytics", label: "Charts", icon: <FileText size={18} /> }
    ];

    if (loading) return null;

    return (
        <>
            {/* --- MAIN NAV BAR --- */}
            <nav className={`sticky top-0 z-[60] transition-all duration-300 border-b ${scrolled ? "bg-[#020617]/90 backdrop-blur-md py-3 border-gray-800" : "bg-transparent py-5 border-transparent"
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                    {/* Logo Area */}
                    <div
                        onClick={() => handleNavigation("/")}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
                            <span className="text-white text-lg font-bold italic">S</span>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-white uppercase">
                            Spends<span className="text-blue-500">.</span>
                        </span>
                    </div>

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-900/50 p-1 rounded-2xl border border-gray-800/50">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => handleNavigation(link.path)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive(link.path) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex items-center gap-3 pl-4 pr-2 py-1.5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors hidden sm:block">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Get Started
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- SLIDE-OUT SIDEBAR --- */}
            {isMobileMenuOpen && (
                <>
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-[320px] bg-[#020617] border-l border-gray-800 z-[110] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        {/* Sidebar Header */}
                        <div className="p-8 border-b border-gray-800/50 bg-gray-900/20">
                            <div className="flex justify-between items-center mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-800 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || "Member"}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-1">{user?.email}</p>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Navigation</h3>
                                <div className="space-y-1">
                                    {navLinks.map((link) => (
                                        <button
                                            key={link.path}
                                            onClick={() => handleNavigation(link.path)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isActive(link.path) ? "bg-blue-600/10 border border-blue-500/20 text-white" : "text-gray-500 hover:bg-white/[0.03] hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={isActive(link.path) ? "text-blue-500" : "text-gray-600"}>{link.icon}</span>
                                                <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                                            </div>
                                            <ChevronRight size={14} className={isActive(link.path) ? "opacity-100" : "opacity-0"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Account Control</h3>
                                <div className="space-y-1">
                                    <button onClick={() => handleNavigation("/profile")} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-white/[0.03] hover:text-white transition-all">
                                        <User size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Profile</span>
                                    </button>
                                    <button onClick={() => handleNavigation("/settings")} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-white/[0.03] hover:text-white transition-all">
                                        <Settings size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Settings</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="p-6 border-t border-gray-800/50">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <LogOut size={16} />
                                    Sign Out
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
