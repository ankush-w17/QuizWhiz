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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h2 className="text-xl font-medium text-slate-300">Authenticating...</h2>
      </div>
    </div>
  );
};

export default AuthSuccess;
