import React from "react";
import { Link, useLocation } from "react-router-dom";

interface ComingSoonProps {
  moduleName?: string;
  phaseNumber?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ moduleName }) => {
  const location = useLocation();
  const title = location.pathname.includes("payment")
    ? "Payments"
    : location.pathname.includes("team")
      ? "Team & Roles"
      : moduleName || "Module";

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md w-full border border-aviation-800 bg-aviation-900 rounded-md p-6 text-center space-y-2">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-[12px] text-slate-500">
          This module is not available yet. Existing booking, payment, and operations functions remain on their current screens.
        </p>
        <Link to="/" className="inline-block mt-3 text-[12px] text-slate-300 hover:text-white">
          Return to overview
        </Link>
      </div>
    </div>
  );
};
