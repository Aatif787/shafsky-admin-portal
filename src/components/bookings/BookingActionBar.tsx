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
    <div className="bg-aviation-900 border border-aviation-800 rounded-md p-4 space-y-3">
      <div>
        <div className="text-[11px] text-slate-500">Operational actions</div>
        <div className="mt-1 text-[13px] text-white">
          {booking.status} <span className="text-slate-500">v{booking.version || 1}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {status === "PENDING" && (
          <button
            type="button"
            onClick={onOpenConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirm booking
          </button>
        )}
        {(status === "CONFIRMED" || status === "ASSIGNED") && (
          <button
            type="button"
            onClick={() => onOpenAdvance("IN_PROGRESS")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Start service
          </button>
        )}
        {status === "IN_PROGRESS" && (
          <button
            type="button"
            onClick={() => onOpenAdvance("COMPLETED")}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Complete service
          </button>
        )}
        {!isTerminal && (
          <button
            type="button"
            onClick={onOpenCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium text-rose-300 border border-rose-900/60 hover:bg-rose-950/40 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel booking
          </button>
        )}
        {canRecycle && onOpenRecycle && (
          <button
            type="button"
            onClick={onOpenRecycle}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium text-slate-300 border border-aviation-800 hover:border-rose-900 hover:text-rose-300 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Move to bin
          </button>
        )}
        {isTerminal && !canRecycle && (
          <p className="text-[12px] text-slate-500">Terminal state — read only.</p>
        )}
      </div>
    </div>
  );
};
