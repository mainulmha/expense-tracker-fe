import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authAPI from "../services/authAPI";
import toast, { Toaster } from "react-hot-toast";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [status, setStatus] = useState("verifying"); // verifying, success, expired, invalid, error, no-token
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [inputEmail, setInputEmail] = useState("");
    const [resendSuccess, setResendSuccess] = useState(false);

    const hasVerified = useRef(false);

    // Verify a token only once for this page load.
    useEffect(() => {
        if (!token) {
            setStatus("no-token");
            return;
        }

        if (hasVerified.current) return;
        hasVerified.current = true;

        verifyEmail();
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const verifyEmail = async () => {
        try {
            const response = await authAPI.get(`/verify-email?token=${token}`);
            console.log("Verification response:", response.data);

            if (response.data.success) {
                setStatus("success");
                toast.success("Email verified successfully!");

                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setStatus("invalid");
                setErrorMessage(response.data.message || "Invalid verification link");
                toast.error(response.data.message || "Invalid link");
            }
        } catch (error) {
            console.error("Verification error:", error);
            const errorData = error.response?.data;

            if (errorData?.expired || errorData?.message?.includes("expired")) {
                setStatus("expired");
                setEmail(errorData?.email || "");
                toast.error("Verification link has expired!");
            } else if (errorData?.message === "Invalid verification token") {
                setStatus("invalid");
                setErrorMessage("This verification link is invalid or already used.");
                toast.error("Invalid verification link");
            } else {
                setStatus("error");
                setErrorMessage(errorData?.message || "Something went wrong");
                toast.error(errorData?.message || "Verification failed");
            }
        }
    };

    const handleResendEmail = async () => {
        let userEmail = email;

        if (!userEmail && !showEmailInput) {
            setShowEmailInput(true);
            return;
        }

        if (!userEmail && showEmailInput) {
            userEmail = inputEmail;
            if (!userEmail) {
                toast.error("Please enter your email address");
                return;
            }
        }

        setResending(true);
        try {
            const res = await authAPI.post("/resend-verification", { email: userEmail });
            if (res.data.success) {
                setResendSuccess(true);
                toast.success("New verification email sent! Please check your inbox.");
                // ✅ এখানে status "expired" এ থাকবে, "verifying" এ যাবে না
                // ইউজারকে বলবে চেক করতে
            } else {
                toast.error(res.data.message || "Failed to resend");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend email");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="app-shell flex items-center justify-center px-4">
            <Toaster position="top-right" />

            <div className="app-card p-8 text-center max-w-md w-full">

                {/* Verifying State */}
                {status === "verifying" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
                        <p className="text-gray-400">Please wait a moment</p>
                    </>
                )}

                {/* Success State */}
                {status === "success" && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-5xl">✅</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Email Verified!</h2>
                        <p className="text-gray-400 mb-6">Your email has been successfully verified.</p>
                        <p className="text-blue-400 text-sm">Redirecting to dashboard...</p>
                    </>
                )}

                {/* Expired State */}
                {status === "expired" && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <span className="text-5xl">⏰</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Link Expired</h2>

                        {resendSuccess ? (
                            // ✅ ইমেল রিসেন্ড成功后 দেখাবে
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <span className="text-5xl">📧</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-white mb-2">Email Sent!</h2>
                                <p className="text-gray-400 mb-4">
                                    A new verification link has been sent to your email.
                                </p>
                                <p className="text-blue-400 text-sm mb-6">
                                    Please check your inbox and click the verification link.
                                </p>
                                <button
                                    onClick={() => {
                                        setResendSuccess(false);
                                        setShowEmailInput(false);
                                        setInputEmail("");
                                    }}
                                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-xl w-full transition"
                                >
                                    Back
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-400 mb-6">This verification link has expired. Request a new one below.</p>

                                {showEmailInput && (
                                    <div className="mb-4">
                                        <input
                                            type="email"
                                            value={inputEmail}
                                            onChange={(e) => setInputEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="app-field"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleResendEmail}
                                    disabled={resending}
                                    className="app-primary-button px-6 py-3 w-full"
                                >
                                    {resending ? "Sending..." : "Resend Verification Email"}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Invalid State */}
                {status === "invalid" && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                            <span className="text-5xl">❌</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Invalid Link</h2>
                        <p className="text-gray-400 mb-6">{errorMessage || "This verification link is invalid or already used."}</p>
                        <button
                            onClick={() => navigate("/")}
                            className="app-primary-button px-6 py-3 w-full"
                        >
                            Go to Home
                        </button>
                    </>
                )}

                {/* Error State */}
                {status === "error" && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                            <span className="text-5xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Something Went Wrong</h2>
                        <p className="text-gray-400 mb-6">{errorMessage || "Please try again later."}</p>
                        <button
                            onClick={() => navigate("/")}
                            className="app-primary-button px-6 py-3 w-full"
                        >
                            Go to Home
                        </button>
                    </>
                )}

                {/* No Token State */}
                {status === "no-token" && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-5xl">🔗</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">No Token Found</h2>
                        <p className="text-gray-400 mb-6">Please check your email and click the correct verification link.</p>
                        <button
                            onClick={() => navigate("/")}
                            className="app-primary-button px-6 py-3 w-full"
                        >
                            Go to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
