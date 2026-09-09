import React from "react";
import { RefreshCw, Activity, ShieldCheck } from "lucide-react";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface DashboardHeaderProps {
  lastUpdated?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
}) => {
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top enterprise accent bar with lime green & orange gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-lime-500 via-emerald-500 to-orange-500" />

      <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          {/* Highlighted section badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-lime-50 text-lime-800 border border-lime-200 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-600" />
              </span>
              <span>Operations Overview</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
              <Activity className="h-3 w-3 text-orange-600" />
              <span>Live Updates</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200">
              <ShieldCheck className="h-3 w-3 text-lime-600" />
              <span>Online</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
              Operations Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Today · {today} (IST) · Summary of bookings, charter requests, and airport handling.
            </p>
          </div>

          {lastUpdated && (
            <p className="text-[11px] text-slate-400 font-mono">
              Last updated {formatOperationalDateTime(lastUpdated)}
            </p>
          )}
        </div>

        {/* Refresh Action Control */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 transition-all select-none cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-lime-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
