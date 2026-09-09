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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Private Charter Desk
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Aviation Inquiries & Fleet Operations
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/charter")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span>Open Desk</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {/* New Enquiries */}
        <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>New Enquiries</span>
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-orange-700 tabular-nums">
            {isLoading ? "—" : metrics.newEnquiries}
          </div>
        </div>

        {/* Awaiting Quote */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>Awaiting Quote</span>
            <FileText className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-800 tabular-nums">
            {isLoading ? "—" : metrics.awaitingQuote}
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-lime-50/50 p-3 rounded-xl border border-lime-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
            <span>Confirmed</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-lime-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-lime-700 tabular-nums">
            {isLoading ? "—" : metrics.confirmedToday}
          </div>
        </div>
      </div>
    </div>
  );
};
