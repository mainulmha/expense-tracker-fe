import { useState } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import Button from "../common/Button";
import authAPI from "../../services/authAPI";
import { useAuth } from "../../context/AuthContext";


export default function SignupForm({ onClose, onSwitchToLogin, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth(); // 👈 useAuth থেকে register নিন

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

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // SignupForm.jsx - handleSubmit আপডেট করুন
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);

        try {
            const response = await authAPI.post("/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Show verification message
                toast.success("Please check your email to verify your account!");

                // Switch to login after 2 seconds
                setTimeout(() => {
                    onSwitchToLogin();
                }, 3000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        toast.loading(`Redirecting to ${provider}...`);
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };

    // ✅ সেফ নেভিগেশন ফাংশন
    const handleSwitchToLogin = () => {
        if (onSwitchToLogin && typeof onSwitchToLogin === 'function') {
            onSwitchToLogin();
        } else {
            console.warn("onSwitchToLogin is not a function");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Header Section */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Create Account</h2>
                <p className="text-gray-400 text-sm">Sign up to get started</p>
            </div>

            {/* Name Field */}
            <InputField
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                required
            />

            {/* Email Field */}
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

            {/* Password Field */}
            <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-300"
                    >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                }
            />

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
                className="w-full"
            >
                {submitting ? "Creating account..." : "Sign Up"}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-[#1f2937] text-gray-500">Or sign up with</span>
                </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="text-sm w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg transition-all"
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
                    className="text-sm w-full flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2.5 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                    </svg>
                    <span>Continue with Facebook</span>
                </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
                <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={handleSwitchToLogin}
                        className="text-green-400 hover:text-green-300 font-medium transition"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </form>
    );
}
