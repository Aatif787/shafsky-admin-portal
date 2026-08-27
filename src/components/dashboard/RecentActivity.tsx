import React from "react";
import { Activity } from "lucide-react";
import type { AuditLogRecord } from "../../types/dashboard";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface RecentActivityProps {
  logs: AuditLogRecord[];
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-aviation-800 bg-aviation-900/60 p-5 space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-aviation-800 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-aviation-850 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-aviation-800 bg-aviation-900/60 p-4 sm:p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-aviation-800 border border-aviation-700 text-aviation-gold">
            <Activity className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-display font-semibold text-white">
            Operational Audit Log
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Live Backend Trail
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 font-mono">
          No recent administrative audit events recorded.
        </div>
      ) : (
        <div className="divide-y divide-aviation-850">
          {logs.map((log) => {
            const timeStr = formatOperationalDateTime(log.timestamp);
            const actionClean = (log.action || "SYSTEM_EVENT").replace(/_/g, " ");

            return (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-aviation-gold/80 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 uppercase text-[11px] font-mono tracking-wider">
                      {actionClean}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {log.actorEmail} • <span className="text-slate-500">{log.resourceType || "Admin Core"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                  {timeStr.split(",")[1]?.trim() || timeStr}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
