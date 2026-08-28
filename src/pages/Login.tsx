import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
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
      setLocalError("Please enter both email and password.");
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) navigate(from, { replace: true });
    else setLocalError(result.error || "Invalid email or password.");
  };

  const displayError = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-aviation-950 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Shafsky</p>
          <h1 className="mt-1 text-lg font-semibold text-white">Aviation Operations</h1>
          <p className="mt-1 text-[12px] text-slate-500">Authorized operators only.</p>
        </div>

        <div className="border border-aviation-800 bg-aviation-900 rounded-md p-6 space-y-4">
          {displayError && (
            <Alert variant="error" title="Sign in failed">
              {displayError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Operator email"
              type="email"
              placeholder="operator@shafskyaviation.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
