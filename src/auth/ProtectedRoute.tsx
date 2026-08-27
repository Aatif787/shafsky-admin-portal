import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { AccessDenied } from "../pages/AccessDenied";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ["SUPER_ADMIN", "ADMIN", "OPERATIONS_MANAGER", "DUTY_OFFICER", "DISPATCHER"],
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aviation-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-aviation-gold/20 border-t-aviation-gold animate-spin" />
            <Loader2 className="absolute h-5 w-5 text-aviation-gold animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-xs font-mono tracking-widest text-aviation-gold/80 uppercase">Shafsky Operations</p>
            <p className="text-sm text-slate-400">Verifying secure session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const currentRole = (user.role || "").toUpperCase();
  const isAuthorized = allowedRoles.includes(currentRole);

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
