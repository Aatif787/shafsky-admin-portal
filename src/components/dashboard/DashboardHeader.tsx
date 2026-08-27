import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
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
  const currentIST = formatOperationalDateTime(new Date().toISOString());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-aviation-850">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Ops Feed
          </span>
          <span className="text-xs font-mono text-slate-500">•</span>
          <span className="text-xs font-mono text-slate-400">{currentIST}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-1">
          Operations Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time booking dispatch, operational metrics, and ground handling attention queue.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Last Synced</div>
            <div className="text-xs font-mono text-slate-300">
              {formatOperationalDateTime(lastUpdated).split(",")[1]?.trim() || "Just now"}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          className="text-xs font-medium"
        >
          {isRefreshing ? "Syncing..." : "Refresh Feed"}
        </Button>
      </div>
    </div>
  );
};
