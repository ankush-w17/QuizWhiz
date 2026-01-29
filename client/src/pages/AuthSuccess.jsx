import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { login } = useAuth(); // We might reload context or just rely on cookie

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // In a real app we might verify token or just reload user context
      // Since cookie is httpOnly, we can't read it, but the token is in URL 
      // primarily for non-cookie fallback or just signal.
      
      // Force a reload of the app or user context to pick up the new cookie
      window.location.href = "/"; 
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
      <h2>Authenticating...</h2>
    </div>
  );
};

export default AuthSuccess;
