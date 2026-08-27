/**
 * CharterSummaryCard — Phase 19B
 * Dashboard overview widget for Private Charter Desk metrics.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Plane, ArrowRight, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import type { CharterDeskMetrics } from "../../types/charter";

interface CharterSummaryCardProps {
  metrics?: CharterDeskMetrics;
  isLoading?: boolean;
}

export const CharterSummaryCard: React.FC<CharterSummaryCardProps> = ({
  metrics = { newEnquiries: 0, awaitingQuote: 0, confirmedToday: 0, totalActive: 0 },
  isLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-gold/10 border border-aviation-gold/30 text-aviation-gold">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
              Private Charter Desk
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Aviation Inquiries & Fleet Operations
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/charter")}
          className="inline-flex items-center gap-1 text-xs font-medium text-aviation-gold hover:underline font-mono"
        >
          <span>Open Desk</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {/* New Enquiries */}
        <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>New Enquiries</span>
            <Sparkles className="h-3 w-3 text-amber-400" />
          </div>
          <div className="mt-2 text-lg font-mono font-bold text-amber-300">
            {isLoading ? "—" : metrics.newEnquiries}
          </div>
        </div>

        {/* Awaiting Quote */}
        <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Awaiting Quote</span>
            <FileText className="h-3 w-3 text-violet-400" />
          </div>
          <div className="mt-2 text-lg font-mono font-bold text-violet-300">
            {isLoading ? "—" : metrics.awaitingQuote}
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Confirmed</span>
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-mono font-bold text-emerald-400">
            {isLoading ? "—" : metrics.confirmedToday}
          </div>
        </div>
      </div>
    </div>
  );
};
