import React from "react";
import { useAuth } from "../auth/useAuth";
import { ShieldAlert, LogOut } from "lucide-react";

export const AccessDenied: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full border border-slate-200 bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-display font-bold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            This portal console is restricted to certified ADMIN and SUPER_ADMIN flight operators.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Account:</span>
            <span className="text-slate-900 font-semibold">{user?.email || "Unknown"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Role:</span>
            <span className="text-orange-600 font-semibold">{role || "CUSTOMER"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out Account</span>
        </button>
      </div>
    </div>
  );
};
