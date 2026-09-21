import React, { useMemo } from "react";
import type { AuditLogRecord } from "../../types/dashboard";
import { formatOperationalDateTime } from "../../lib/dateUtils";
import { useAuth } from "../../auth/useAuth";

interface RecentActivityProps {
  logs: AuditLogRecord[];
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, isLoading }) => {
  const { role } = useAuth();

  // Non–SUPER_ADMIN staff must not see break-glass SUPER_ADMIN activity.
  const visibleLogs = useMemo(() => {
    if ((role || "").toUpperCase() === "SUPER_ADMIN") return logs;
    return logs.filter(
      (log) => (log.actorRole || "").toUpperCase() !== "SUPER_ADMIN"
    );
  }, [logs, role]);

  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Audit Trail</h3>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-100 animate-pulse rounded-md" />
          ))}
        </div>
      ) : visibleLogs.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-slate-500 font-medium">No recent audit events.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {visibleLogs.map((log) => (
            <div key={log.id} className="px-4 py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">{(log.action || "SYSTEM_EVENT").replace(/_/g, " ")}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {log.actorEmail} · {log.resourceType || "system"}
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {formatOperationalDateTime(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
