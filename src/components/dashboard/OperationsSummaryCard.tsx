/**
 * OperationsSummaryCard — Phase 20
 * Dashboard overview widget for Airport Ground Operations metrics.
 */

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
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-gold/10 border border-aviation-gold/30 text-aviation-gold">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
              Operations Queue
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Airport Ground Services & Dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/operations")}
          className="inline-flex items-center gap-1 text-xs font-medium text-aviation-gold hover:underline font-mono"
        >
          <span>Open Desk</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {/* New */}
        <div className="bg-aviation-850/60 p-2.5 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>New</span>
            <Sparkles className="h-3 w-3 text-amber-400" />
          </div>
          <div className="mt-1.5 text-base font-mono font-bold text-amber-300">
            {isLoading ? "—" : metrics.newCount}
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-aviation-850/60 p-2.5 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Assigned</span>
            <UserCheck className="h-3 w-3 text-sky-400" />
          </div>
          <div className="mt-1.5 text-base font-mono font-bold text-sky-300">
            {isLoading ? "—" : metrics.assignedCount}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-aviation-850/60 p-2.5 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>In Action</span>
            <Play className="h-3 w-3 text-indigo-400" />
          </div>
          <div className="mt-1.5 text-base font-mono font-bold text-indigo-300">
            {isLoading ? "—" : metrics.inProgressCount}
          </div>
        </div>

        {/* Today */}
        <div className="bg-aviation-850/60 p-2.5 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Today</span>
            <Calendar className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="mt-1.5 text-base font-mono font-bold text-emerald-400">
            {isLoading ? "—" : metrics.todayCount}
          </div>
        </div>
      </div>
    </div>
  );
};
