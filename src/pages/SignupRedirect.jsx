import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("authModalOpen", "true");
    localStorage.setItem("authModalMode", "signup");
    navigate("/");
  }, [navigate]);

  return null;
}
