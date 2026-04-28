import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("authModalOpen", "true");
        localStorage.setItem("authModalMode", "login");
        navigate("/");
    }, [navigate]);

    return null;
}
