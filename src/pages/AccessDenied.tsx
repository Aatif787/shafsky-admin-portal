import React from "react";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export const AccessDenied: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-aviation-950 px-4">
      <div className="max-w-md w-full rounded-2xl border border-rose-900/40 bg-aviation-900/80 p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-rose-400">
            Authorization Violation
          </div>
          <h1 className="text-xl font-display font-bold text-white">
            Access Denied
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account does not possess the administrative privileges required to access the Shafsky Aviation Operations Portal.
          </p>
        </div>

        <div className="rounded-xl border border-aviation-800 bg-aviation-950/60 p-4 space-y-2 text-left text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Account:</span>
            <span className="text-slate-300 font-semibold">{user?.email || "Unknown"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Assigned Role:</span>
            <Badge variant="rose" size="sm">
              {role || "CUSTOMER"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Required Role:</span>
            <span className="text-aviation-gold font-semibold">ADMIN / SUPER_ADMIN</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            className="w-full"
            onClick={() => logout()}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign Out & Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
};
