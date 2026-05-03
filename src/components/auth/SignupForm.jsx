import { useState } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import Button from "../common/Button";
import authAPI from "../../services/authAPI";
import OAuthButtons from "./OAuthButtons";


export default function SignupForm({ onSwitchToLogin }) {
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

    // const { register } = useAuth(); // 👈 useAuth থেকে register নিন

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


    // const handleOAuthLogin = (provider) => {
    //     const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    //     console.log("Redirecting to:", `${BASE_URL}/api/auth/${provider}`);
    //     window.location.href = `${BASE_URL}/api/auth/${provider}`;
    // };

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
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
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
                    <span className="px-3 bg-[#111827] text-gray-500">Or sign up with</span>
                </div>
            </div>

            {/* OAuth Buttons */}
            <OAuthButtons />

            {/* Login Link */}
            <div className="text-center">
                <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={handleSwitchToLogin}
                        className="text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                        Sign in
                    </button>
                </p>
            </div>

        </form>
    );
}
