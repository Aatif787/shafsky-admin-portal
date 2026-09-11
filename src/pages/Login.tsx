import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Plane } from "lucide-react";
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
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) navigate(from, { replace: true });
    else setLocalError(result.error || "Incorrect email or password. Please try again.");
  };

  const displayError = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Lime and orange top accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-lime-500 via-emerald-500 to-orange-500" />

          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-50 border border-lime-200 text-lime-700 shadow-2xs mb-3">
                <Plane className="h-6 w-6 transform -rotate-45" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Shafsky Aviation
              </span>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                Admin Portal
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Sign in to manage bookings, flights, and daily operations.
              </p>
            </div>

            {displayError && (
              <Alert variant="error" title="Sign in failed">
                {displayError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address or Admin ID"
                type="text"
                placeholder="name@company.com or Admin ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                autoComplete="username"
                autoFocus
                required
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-xs py-2.5 text-sm"
                  isLoading={isSubmitting}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-lime-600" />
              <span>Secure admin sign-in</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Shafsky Aviation · All rights reserved
        </p>
      </div>
    </div>
  );
};
