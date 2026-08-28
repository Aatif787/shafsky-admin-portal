import React from "react";
import type { AuditLogRecord } from "../../types/dashboard";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface RecentActivityProps {
  logs: AuditLogRecord[];
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, isLoading }) => {
  return (
    <section className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="px-4 py-2.5 border-b border-aviation-800">
        <h3 className="text-[13px] font-semibold text-white">Audit trail</h3>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-aviation-850 animate-pulse rounded" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="px-4 py-8 text-center text-[13px] text-slate-500">No recent audit events.</div>
      ) : (
        <div className="divide-y divide-aviation-800">
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-2.5 flex items-start justify-between gap-3 text-[12px]">
              <div className="min-w-0">
                <div className="text-slate-200">{(log.action || "SYSTEM_EVENT").replace(/_/g, " ")}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {log.actorEmail} · {log.resourceType || "system"}
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 shrink-0">
                {formatOperationalDateTime(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
