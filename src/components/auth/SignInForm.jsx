import { useState } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import Button from "../common/Button";
import authAPI from "../../services/authAPI";  // 👈 API এর জায়গায় authAPI
import { useAuth } from "../../context/AuthContext";

export default function SignInForm({ onClose, onSwitchToSignup, onSwitchToForgot, onSuccess }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth(); // 👈 useAuth থেকে login নিন

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

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // ✅ useAuth এর login ফাংশন ব্যবহার করুন
            const success = await login({
                email: formData.email,
                password: formData.password
            });

            if (success) {
                // Modal বন্ধ করুন
                if (onClose) onClose();
            }

        } catch (err) {
            if (err.response?.data?.needsVerification) {
                toast.error("Please verify your email first! Check your inbox.");
                // Optionally show resend button
            } else {
                toast.error(err.response?.data?.message || "Invalid email or password!");
            }
            toast.error(err.response?.data?.message || "Invalid email or password!");
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        toast.loading(`Redirecting to ${provider}...`);
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-base sm:text-xl font-semibold text-white mb-1">Welcome Back!</h2>
                <p className="text-gray-400 text-sm sm:text-base">Sign in to your account</p>
            </div>

            {/* Email */}
            <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                error={errors.email}
                required
            />

            {/* Password */}
            <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
                required
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-300"
                    >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                }
            />

            {/* Forgot Password Link */}
            <div className="text-right -mt-2">
                <button
                    type="button"
                    onClick={() => onSwitchToForgot?.()}
                    className="text-sm text-green-400 hover:text-green-300 transition"
                >
                    Forgot Password?
                </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="sm" disabled={submitting} className="w-full">
                {submitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-[#1f2937] text-gray-500">Or continue with</span>
                </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg transition-all text-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleOAuthLogin('facebook')}
                    className="w-full flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2.5 rounded-lg transition-all text-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                    </svg>
                    <span>Continue with Facebook</span>
                </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
                <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button type="button" onClick={onSwitchToSignup} className="text-green-400 hover:text-green-300 font-medium">
                        Sign up now
                    </button>
                </p>
            </div>
        </form>
    );
}
