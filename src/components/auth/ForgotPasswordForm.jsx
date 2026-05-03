import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { ArrowLeft, Mail } from "lucide-react";
import authAPI from "../../services/authAPI";

export default function ForgotPasswordForm({ onClose, onBackToLogin }) {
    // ✅ localStorage থেকে state রিস্টোর করুন
    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem("forgotPasswordStep");
        return saved ? parseInt(saved) : 1;
    });

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("forgotPasswordData");
        return saved ? JSON.parse(saved) : {
            email: "",
            otp: "",
            newPassword: "",
            confirmPassword: ""
        };
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ✅ State পরিবর্তন হলে localStorage এ save করুন
    useEffect(() => {
        localStorage.setItem("forgotPasswordStep", step.toString());
        localStorage.setItem("forgotPasswordData", JSON.stringify(formData));
    }, [step, formData]);

    // ✅ কম্পোনেন্ট মাউন্ট হলে চেক করুন কোন স্টেপে ছিল
    useEffect(() => {
        console.log("Current step:", step);
        console.log("Saved email:", formData.email);

        // যদি step 2 বা 3 এ থাকে এবং OTP টাইমার চালু করার দরকার
        if (step === 2 && formData.email) {
            // টাইমার চালানোর দরকার হলে এখানে করুন
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            setErrors({ email: "Email is required" });
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors({ email: "Please enter a valid email" });
            return;
        }

        setSubmitting(true);

        try {
            const response = await authAPI.post("/forgot-password", {
                email: formData.email
            });

            if (response.data.success) {
                toast.success("OTP sent to your email! ✅");
                setStep(2);

                setResendDisabled(true);
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setResendDisabled(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP!");
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!formData.otp.trim()) {
            setErrors({ otp: "OTP is required" });
            return;
        }
        if (formData.otp.length !== 6) {
            setErrors({ otp: "OTP must be 6 digits" });
            return;
        }

        setSubmitting(true);

        try {
            const response = await authAPI.post("/verify-otp", {
                email: formData.email,
                otp: formData.otp
            });

            if (response.data.success) {
                toast.success("OTP verified! ✅");
                setStep(3);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP!");
        } finally {
            setSubmitting(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setResendDisabled(true);
        setCountdown(60);

        try {
            await authAPI.post("/forgot-password", {
                email: formData.email
            });
            toast.success("OTP resent! ✅");

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch {
            toast.error("Failed to resend OTP!");
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    // Step 3: Reset Password
    const validatePassword = () => {
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = "Password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setSubmitting(true);

        try {
            const response = await authAPI.post("/reset-password", {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                toast.success("Password reset successfully! ✅");

                // ✅ সফল হলে localStorage clean করুন
                localStorage.removeItem("forgotPasswordStep");
                localStorage.removeItem("forgotPasswordData");

                setTimeout(() => {
                    onBackToLogin?.();
                    onClose?.();
                }, 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password!");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleSendOTP} className="space-y-5">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                    <span className="text-3xl">🔐</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Forgot Password?</h2>
                <p className="text-gray-400 text-sm">
                    Enter your email address and we'll send you a verification code
                </p>
            </div>

            <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                error={errors.email}
                required
                leftIcon={<Mail size={18} className="text-gray-500" />}
            />

            <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
                {submitting ? "Sending..." : "Send Reset Code"}
            </Button>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-sm text-gray-400 hover:text-blue-400 transition flex items-center justify-center gap-1"
                >
                    <ArrowLeft size={14} />
                    Back to Login
                </button>
            </div>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                    <span className="text-3xl">📧</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Verify Code</h2>
                <p className="text-gray-400 text-sm">
                    We've sent a 6-digit code to <br />
                    <span className="text-blue-400 font-medium">{formData.email}</span>
                </p>
            </div>

            <InputField
                label="Verification Code"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                error={errors.otp}
                required
                maxLength="6"
            />

            <div className="text-center">
                <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendDisabled}
                    className="text-sm text-blue-400 hover:text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resendDisabled ? `Resend code in ${countdown}s` : "Resend Code"}
                </button>
            </div>

            <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
                {submitting ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-400 hover:text-blue-400 transition flex items-center justify-center gap-1"
                >
                    <ArrowLeft size={14} />
                    Back to Email
                </button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                    <span className="text-3xl">🔒</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Reset Password</h2>
                <p className="text-gray-400 text-sm">
                    Create a new password for your account
                </p>
            </div>

            <InputField
                label="New Password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                error={errors.newPassword}
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

            <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
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

            <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
                {submitting ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-sm text-gray-400 hover:text-blue-400 transition flex items-center justify-center gap-1"
                >
                    <ArrowLeft size={14} />
                    Back to Login
                </button>
            </div>
        </form>
    );

    return (
        <div className="w-full">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </div>
    );
}


// import { useState } from "react";
// import toast from "react-hot-toast";
// import InputField from "../common/InputField";
// import Button from "../common/Button";
// import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
// import authAPI from "../../services/authAPI";

// export default function ForgotPasswordForm({ onClose, onBackToLogin }) {
//     const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
//     const [formData, setFormData] = useState({
//         email: "",
//         otp: "",
//         newPassword: "",
//         confirmPassword: ""
//     });
//     const [errors, setErrors] = useState({});
//     const [submitting, setSubmitting] = useState(false);
//     const [resendDisabled, setResendDisabled] = useState(false);
//     const [countdown, setCountdown] = useState(0);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));

//         if (errors[name]) {
//             setErrors(prev => {
//                 const updated = { ...prev };
//                 delete updated[name];
//                 return updated;
//             });
//         }
//     };

//     // Step 1: Send OTP to Email
//     const handleSendOTP = async (e) => {
//         e.preventDefault();

//         if (!formData.email.trim()) {
//             setErrors({ email: "Email is required" });
//             return;
//         }
//         if (!/\S+@\S+\.\S+/.test(formData.email)) {
//             setErrors({ email: "Please enter a valid email" });
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const response = await authAPI.post("/forgot-password", {
//                 email: formData.email
//             });

//             if (response.data.success) {
//                 toast.success("OTP sent to your email! ✅");
//                 setStep(2);

//                 // Start countdown for resend
//                 setResendDisabled(true);
//                 setCountdown(60);
//                 const timer = setInterval(() => {
//                     setCountdown(prev => {
//                         if (prev <= 1) {
//                             clearInterval(timer);
//                             setResendDisabled(false);
//                             return 0;
//                         }
//                         return prev - 1;
//                     });
//                 }, 1000);
//             }
//         } catch (err) {
//             toast.error(err.response?.data?.message || "Failed to send OTP!");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Step 2: Verify OTP
//     const handleVerifyOTP = async (e) => {
//         e.preventDefault();

//         if (!formData.otp.trim()) {
//             setErrors({ otp: "OTP is required" });
//             return;
//         }
//         if (formData.otp.length !== 6) {
//             setErrors({ otp: "OTP must be 6 digits" });
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const response = await authAPI.post("/verify-otp", {
//                 email: formData.email,
//                 otp: formData.otp
//             });

//             if (response.data.success) {
//                 toast.success("OTP verified! ✅");
//                 setStep(3);
//             }
//         } catch (err) {
//             toast.error(err.response?.data?.message || "Invalid OTP!");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Resend OTP
//     const handleResendOTP = async () => {
//         setResendDisabled(true);
//         setCountdown(60);

//         try {
//             await authAPI.post("/forgot-password", {
//                 email: formData.email
//             });
//             toast.success("OTP resent! ✅");

//             const timer = setInterval(() => {
//                 setCountdown(prev => {
//                     if (prev <= 1) {
//                         clearInterval(timer);
//                         setResendDisabled(false);
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
//         } catch (err) {
//             toast.error("Failed to resend OTP!");
//             setResendDisabled(false);
//             setCountdown(0);
//         }
//     };

//     // Step 3: Reset Password
//     const validatePassword = () => {
//         const newErrors = {};

//         if (!formData.newPassword) {
//             newErrors.newPassword = "Password is required";
//         } else if (formData.newPassword.length < 6) {
//             newErrors.newPassword = "Password must be at least 6 characters";
//         }

//         if (formData.newPassword !== formData.confirmPassword) {
//             newErrors.confirmPassword = "Passwords do not match";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleResetPassword = async (e) => {
//         e.preventDefault();
//         if (!validatePassword()) return;

//         setSubmitting(true);

//         try {
//             const response = await authAPI.post("/reset-password", {
//                 email: formData.email,
//                 otp: formData.otp,
//                 newPassword: formData.newPassword
//             });

//             if (response.data.success) {
//                 toast.success("Password reset successfully! ✅");

//                 setTimeout(() => {
//                     onBackToLogin?.();
//                     onClose?.();
//                 }, 1500);
//             }
//         } catch (err) {
//             toast.error(err.response?.data?.message || "Failed to reset password!");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // Render different steps
//     const renderStep1 = () => (
//         <form onSubmit={handleSendOTP} className="space-y-5">
//             {/* Header */}
//             <div className="text-center mb-6">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                     <span className="text-3xl">🔐</span>
//                 </div>
//                 <h2 className="text-xl font-semibold text-white mb-1">Forgot Password?</h2>
//                 <p className="text-gray-400 text-sm">
//                     Enter your email address and we'll send you a verification code
//                 </p>
//             </div>

//             {/* Email Field */}
//             <InputField
//                 label="Email Address"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="john@example.com"
//                 error={errors.email}
//                 required
//                 leftIcon={<Mail size={18} className="text-gray-500" />}
//             />

//             {/* Submit Button */}
//             <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
//                 {submitting ? "Sending..." : "Send Reset Code"}
//             </Button>

//             {/* Back to Login */}
//             <div className="text-center pt-2">
//                 <button
//                     type="button"
//                     onClick={onBackToLogin}
//                     className="text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
//                 >
//                     <ArrowLeft size={14} />
//                     Back to Login
//                 </button>
//             </div>
//         </form>
//     );

//     const renderStep2 = () => (
//         <form onSubmit={handleVerifyOTP} className="space-y-5">
//             {/* Header */}
//             <div className="text-center mb-6">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                     <span className="text-3xl">📧</span>
//                 </div>
//                 <h2 className="text-xl font-semibold text-white mb-1">Verify Code</h2>
//                 <p className="text-gray-400 text-sm">
//                     We've sent a 6-digit code to <br />
//                     <span className="text-green-400 font-medium">{formData.email}</span>
//                 </p>
//             </div>

//             {/* OTP Field */}
//             <InputField
//                 label="Verification Code"
//                 name="otp"
//                 type="text"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 placeholder="Enter 6-digit code"
//                 error={errors.otp}
//                 required
//                 maxLength="6"
//             />

//             {/* Resend OTP */}
//             <div className="text-center">
//                 <button
//                     type="button"
//                     onClick={handleResendOTP}
//                     disabled={resendDisabled}
//                     className="text-sm text-green-400 hover:text-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     {resendDisabled ? `Resend code in ${countdown}s` : "Resend Code"}
//                 </button>
//             </div>

//             {/* Submit Button */}
//             <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
//                 {submitting ? "Verifying..." : "Verify Code"}
//             </Button>

//             {/* Back to Email */}
//             <div className="text-center pt-2">
//                 <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
//                 >
//                     <ArrowLeft size={14} />
//                     Back to Email
//                 </button>
//             </div>
//         </form>
//     );

//     const renderStep3 = () => (
//         <form onSubmit={handleResetPassword} className="space-y-5">
//             {/* Header */}
//             <div className="text-center mb-6">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//                     <span className="text-3xl">🔒</span>
//                 </div>
//                 <h2 className="text-xl font-semibold text-white mb-1">Reset Password</h2>
//                 <p className="text-gray-400 text-sm">
//                     Create a new password for your account
//                 </p>
//             </div>

//             {/* New Password */}
//             <InputField
//                 label="New Password"
//                 name="newPassword"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.newPassword}
//                 onChange={handleChange}
//                 placeholder="Enter new password"
//                 error={errors.newPassword}
//                 required
//                 rightIcon={
//                     <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="text-gray-400 hover:text-gray-300"
//                     >
//                         {showPassword ? "👁️" : "👁️‍🗨️"}
//                     </button>
//                 }
//             />

//             {/* Confirm Password */}
//             <InputField
//                 label="Confirm Password"
//                 name="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Confirm new password"
//                 error={errors.confirmPassword}
//                 required
//                 rightIcon={
//                     <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="text-gray-400 hover:text-gray-300"
//                     >
//                         {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
//                     </button>
//                 }
//             />

//             {/* Password Requirements */}
//             <div className="text-xs text-gray-500 space-y-1">
//                 <p>Password must:</p>
//                 <ul className="list-disc list-inside ml-2">
//                     <li className={formData.newPassword.length >= 6 ? "text-green-400" : ""}>
//                         Be at least 6 characters long
//                     </li>
//                 </ul>
//             </div>

//             {/* Submit Button */}
//             <Button type="submit" variant="primary" size="md" disabled={submitting} className="w-full">
//                 {submitting ? "Resetting..." : "Reset Password"}
//             </Button>

//             {/* Back to Login */}
//             <div className="text-center pt-2">
//                 <button
//                     type="button"
//                     onClick={onBackToLogin}
//                     className="text-sm text-gray-400 hover:text-green-400 transition flex items-center justify-center gap-1"
//                 >
//                     <ArrowLeft size={14} />
//                     Back to Login
//                 </button>
//             </div>
//         </form>
//     );

//     return (
//         <div className="w-full">
//             {step === 1 && renderStep1()}
//             {step === 2 && renderStep2()}
//             {step === 3 && renderStep3()}
//         </div>
//     );
// }
