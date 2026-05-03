import { useState } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OAuthButtons from "./OAuthButtons";

export default function SignInForm({ onClose, onSwitchToSignup, onSwitchToForgot, onSuccess }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth(); // 👈 useAuth থেকে login নিন

    const navigate = useNavigate();

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
            const loggedIn = await login({
                email: formData.email,
                password: formData.password
            });

            if (!loggedIn) return;

            onSuccess?.();
            if (onClose) onClose();
            navigate("/");

        } catch (err) {
            console.log(err);
            if (err.response?.data?.needsVerification) {
                toast.error("Please verify your email first! Check your inbox.");
                // Optionally show resend button
            } else {
                toast.error(err.response?.data?.message || "Invalid email or password!");
            }
        }
        finally {
            setSubmitting(false);
        }
    };


    // const handleOAuthLogin = (provider) => {
    //     const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    //     window.location.href = `${BASE_URL}/api/auth/${provider}`;
    // };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
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
            <div className="text-right">
                <button
                    type="button"
                    onClick={() => onSwitchToForgot?.()}
                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                    Forgot Password?
                </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="sm" disabled={submitting} className="w-full">
                {submitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-[#111827] text-gray-500">Or continue with</span>
                </div>
            </div>

            {/* OAuth Buttons */}
            <OAuthButtons />

            {/* Sign Up Link */}
            <div className="text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button type="button" onClick={onSwitchToSignup} className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign up now
                    </button>
                </p>
            </div>
        </form>
    );
}
