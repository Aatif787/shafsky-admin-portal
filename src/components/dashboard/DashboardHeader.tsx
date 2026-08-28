import React from "react";
import { RefreshCw } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-aviation-800">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Operations overview</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Today · {today}</h2>
        {lastUpdated && (
          <p className="mt-0.5 text-[12px] text-slate-500">
            Last synced {formatOperationalDateTime(lastUpdated)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-1.5 self-start rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-aviation-900 disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
};
