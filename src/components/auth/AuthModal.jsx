import { useState, useEffect } from "react";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import SignInForm from "./SignInForm";

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }) {
    const [mode, setMode] = useState(initialMode);

    // পেজ রিফ্রেশে localStorage থেকে mode রিস্টোর করুন (শুধু লগইন অবস্থায়)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // লগআউট অবস্থায় ফরগট পাসওয়ার্ড ডাটা ক্লিয়ার করুন
            localStorage.removeItem("forgotPasswordStep");
            localStorage.removeItem("forgotPasswordData");
            setMode("login");
        } else {
            const savedMode = localStorage.getItem("authModalMode");
            if (savedMode && (savedMode === "login" || savedMode === "signup")) {
                setMode(savedMode);
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            localStorage.setItem("authModalMode", mode);
            localStorage.setItem("authModalOpen", "true");
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleSuccess = (userData) => {
        onSuccess?.(userData);
        onClose();
        localStorage.removeItem("authModalMode");
        localStorage.removeItem("authModalOpen");
        localStorage.removeItem("forgotPasswordStep");
        localStorage.removeItem("forgotPasswordData");
    };

    const handleBackdropClick = (e) => {
        e.stopPropagation();
    };

    const handleClose = () => {
        onClose();
        localStorage.setItem("authModalOpen", "false");
    };

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3 sm:px-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1f2937] w-full max-w-md mx-auto p-4 sm:p-5 md:p-6 rounded-2xl max-h-[90vh] overflow-y-auto relative custom-scroll"
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition"
                >
                    ✕
                </button>

                {mode === "login" && (
                    <SignInForm
                        onClose={handleClose}
                        onSwitchToSignup={() => setMode("signup")}
                        onSwitchToForgot={() => setMode("forgot")}
                        onSuccess={handleSuccess}
                    />
                )}

                {mode === "signup" && (
                    <SignupForm
                        onClose={handleClose}
                        onSwitchToLogin={() => setMode("login")}
                        onSuccess={handleSuccess}
                    />
                )}

                {mode === "forgot" && (
                    <ForgotPasswordForm
                        onClose={handleClose}
                        onBackToLogin={() => setMode("login")}
                    />
                )}
            </div>
        </div>
    );
}
