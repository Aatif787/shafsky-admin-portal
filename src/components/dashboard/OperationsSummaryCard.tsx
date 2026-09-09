import React from "react";
import { useNavigate } from "react-router-dom";
import { Radio, ArrowRight, Sparkles, UserCheck, Play, Calendar } from "lucide-react";
import type { OperationsSummaryMetrics } from "../../types/operations";

interface OperationsSummaryCardProps {
  metrics?: OperationsSummaryMetrics;
  isLoading?: boolean;
}

export const OperationsSummaryCard: React.FC<OperationsSummaryCardProps> = ({
  metrics = { newCount: 0, assignedCount: 0, inProgressCount: 0, todayCount: 0, totalActive: 0 },
  isLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50 border border-lime-200 text-lime-700">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Operations Overview
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-200">
                LIVE OPS
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Airport Ground Services & Dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/operations")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-800 transition-colors"
        >
          <span>Open Desk</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {/* New */}
        <div className="bg-orange-50/40 p-2.5 rounded-xl border border-orange-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>New</span>
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <div className="mt-1.5 text-lg font-bold text-orange-700 tabular-nums">
            {isLoading ? "—" : metrics.newCount}
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>Assigned</span>
            <UserCheck className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div className="mt-1.5 text-lg font-bold text-sky-700 tabular-nums">
            {isLoading ? "—" : metrics.assignedCount}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-lime-50/40 p-2.5 rounded-xl border border-lime-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>In Action</span>
            <Play className="h-3.5 w-3.5 text-lime-600" />
          </div>
          <div className="mt-1.5 text-lg font-bold text-lime-700 tabular-nums">
            {isLoading ? "—" : metrics.inProgressCount}
          </div>
        </div>

        {/* Today */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>Today</span>
            <Calendar className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-800 tabular-nums">
            {isLoading ? "—" : metrics.todayCount}
          </div>
        </div>
      </div>
    </div>
  );
};
