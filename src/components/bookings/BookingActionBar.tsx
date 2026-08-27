/**
 * BookingActionBar — Phase 19A
 * Contextual Operational Action Bar for Booking Detail Page.
 * Derives available actions directly from the authoritative booking status.
 */

import React from "react";
import { CheckCircle2, Play, CheckCheck, XCircle, ShieldAlert } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import type { BookingStatusType } from "../../types/booking";

interface BookingActionBarProps {
  booking: BookingRecord;
  onOpenConfirm: () => void;
  onOpenCancel: () => void;
  onOpenAdvance: (targetStatus: BookingStatusType) => void;
  isLoading: boolean;
}

export const BookingActionBar: React.FC<BookingActionBarProps> = ({
  booking,
  onOpenConfirm,
  onOpenCancel,
  onOpenAdvance,
  isLoading,
}) => {
  const status = (booking.status || "").toUpperCase();

  const isTerminal = status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED";

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg shadow-black/20">
      {/* State & Context */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Current Booking Lifecycle State
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-display font-bold text-white tracking-wide">
              {booking.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Version: v{booking.version || 1})
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* PENDING State Actions */}
        {status === "PENDING" && (
          <>
            <button
              type="button"
              onClick={onOpenConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 select-none"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm Booking
            </button>
            <button
              type="button"
              onClick={onOpenCancel}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 transition-all disabled:opacity-50 select-none"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          </>
        )}

        {/* CONFIRMED or ASSIGNED State Actions */}
        {(status === "CONFIRMED" || status === "ASSIGNED") && (
          <>
            <button
              type="button"
              onClick={() => onOpenAdvance("IN_PROGRESS")}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-sm shadow-sky-600/30 transition-all disabled:opacity-50 select-none"
            >
              <Play className="h-3.5 w-3.5" />
              Start Service
            </button>
            <button
              type="button"
              onClick={onOpenCancel}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 transition-all disabled:opacity-50 select-none"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          </>
        )}

        {/* IN_PROGRESS State Actions */}
        {status === "IN_PROGRESS" && (
          <>
            <button
              type="button"
              onClick={() => onOpenAdvance("COMPLETED")}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 select-none"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Complete Service
            </button>
            <button
              type="button"
              onClick={onOpenCancel}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 transition-all disabled:opacity-50 select-none"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          </>
        )}

        {/* Terminal State Message */}
        {isTerminal && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-aviation-800 border border-aviation-700 text-xs font-mono text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
            Terminal State — Read Only
          </div>
        )}
      </div>
    </div>
  );
};
