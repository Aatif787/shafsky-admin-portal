import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Plane } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(result.error || "Invalid email or password.");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-aviation-950 px-4 py-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-aviation-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Portal Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-aviation-900 border border-aviation-gold/30 shadow-lg shadow-aviation-gold/10">
            <Plane className="h-7 w-7 text-aviation-gold transform -rotate-45" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white uppercase">
              Shafsky Aviation
            </h1>
            <p className="mt-1 text-xs font-mono tracking-widest text-aviation-gold uppercase">
              Operations & Admin Portal
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized operations personnel only. All access attempts are monitored and recorded.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-aviation-800 bg-aviation-900/80 p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {displayError && (
            <Alert variant="error" title="Authentication Error">
              {displayError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Operator Email"
              type="email"
              placeholder="admin@shafskyaviation.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              autoFocus
              required
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-200 transition focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              Sign In to Operations Desk
            </Button>
          </form>

          <div className="border-t border-aviation-800 pt-4 text-center">
            <span className="text-[11px] font-mono text-slate-500">
              FastAPI Asymmetric RS256 Authentication Active
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] font-mono text-slate-600">
          Shafsky Aviation Concierge Platform © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
