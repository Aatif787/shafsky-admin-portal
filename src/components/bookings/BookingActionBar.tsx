import React from "react";
import { CheckCircle2, XCircle, Play, CheckCheck, Trash2 } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import type { BookingStatusType } from "../../types/booking";

interface BookingActionBarProps {
  booking: BookingRecord;
  onOpenConfirm: () => void;
  onOpenCancel: () => void;
  onOpenAdvance: (targetStatus: BookingStatusType) => void;
  onOpenRecycle?: () => void;
  canRecycle?: boolean;
  isLoading: boolean;
}

export const BookingActionBar: React.FC<BookingActionBarProps> = ({
  booking,
  onOpenConfirm,
  onOpenCancel,
  onOpenAdvance,
  onOpenRecycle,
  canRecycle = false,
  isLoading,
}) => {
  const status = (booking.status || "").toUpperCase();
  const isTerminal = status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Operational Actions</div>
        <div className="mt-1 text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>{booking.status}</span>
          <span className="text-xs font-mono font-medium text-slate-400">v{booking.version || 1}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {status === "PENDING" && (
          <button
            type="button"
            onClick={onOpenConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-lime-600 hover:bg-lime-700 shadow-xs disabled:opacity-50 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Booking
          </button>
        )}
        {(status === "CONFIRMED" || status === "ASSIGNED") && (
          <button
            type="button"
            onClick={() => onOpenAdvance("IN_PROGRESS")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs disabled:opacity-50 transition-all"
          >
            <Play className="h-4 w-4" />
            Start Service
          </button>
        )}
        {status === "IN_PROGRESS" && (
          <button
            type="button"
            onClick={() => onOpenAdvance("COMPLETED")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs disabled:opacity-50 transition-all"
          >
            <CheckCheck className="h-4 w-4" />
            Complete Service
          </button>
        )}
        {!isTerminal && (
          <button
            type="button"
            onClick={onOpenCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-all"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel Booking
          </button>
        )}
        {canRecycle && onOpenRecycle && (
          <button
            type="button"
            onClick={onOpenRecycle}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 transition-all shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
            Move to Bin
          </button>
        )}
        {isTerminal && !canRecycle && (
          <p className="text-xs text-slate-400 text-center font-medium">Terminal state — read only.</p>
        )}
      </div>
    </div>
  );
};
