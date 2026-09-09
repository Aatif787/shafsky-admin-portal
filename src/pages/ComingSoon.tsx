import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";

interface ComingSoonProps {
  moduleName?: string;
  phaseNumber?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ moduleName }) => {
  const location = useLocation();
  const title = location.pathname.includes("payment")
    ? "Payments & Settlement"
    : location.pathname.includes("team")
      ? "Team & Operator Roles"
      : moduleName || "Upcoming Section";

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="max-w-md w-full border border-slate-200 bg-white shadow-xs rounded-xl p-8 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600 mx-auto">
          <Clock className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-display font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This section is coming soon. You can continue managing bookings, charter requests, and operations from the menu.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Operations Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
