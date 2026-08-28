import React from "react";
import { useAuth } from "../auth/useAuth";

export const AccessDenied: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-aviation-950 px-4">
      <div className="max-w-md w-full border border-aviation-800 bg-aviation-900 rounded-md p-6 space-y-4">
        <div>
          <h1 className="text-sm font-semibold text-white">Access denied</h1>
          <p className="mt-1 text-[12px] text-slate-400">
            This portal is restricted to ADMIN and SUPER_ADMIN operators.
          </p>
        </div>
        <div className="text-[12px] text-slate-400 space-y-1">
          <div>Account: <span className="text-slate-200">{user?.email || "Unknown"}</span></div>
          <div>Role: <span className="text-slate-200">{role || "CUSTOMER"}</span></div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="w-full rounded-md border border-aviation-800 px-3 py-2 text-[12px] text-slate-200 hover:bg-aviation-850"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
