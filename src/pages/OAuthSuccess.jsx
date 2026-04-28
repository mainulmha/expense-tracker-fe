import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import authAPI from "../services/authAPI";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        const fetchUser = async () => {
            try {
                localStorage.setItem("token", token);
                const response = await authAPI.get("/me");

                if (response.data?.success && response.data?.user) {
                    setAuthData(response.data.user, token);
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("OAuth success error:", error);
                localStorage.removeItem("token");
            } finally {
                navigate("/", { replace: true });
            }
        };

        fetchUser();
    }, [navigate, setAuthData]);

    return <p>Logging you in...</p>;
}