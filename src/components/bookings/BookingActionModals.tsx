/**
 * BookingActionModals — Phase 19A
 * Accessible, safe confirmation dialogs for operational booking mutations.
 */

import React from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, X } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import type { BookingStatusType } from "../../types/booking";
import { formatCurrencyINR } from "../../lib/dateUtils";

/* ─── Modal Base Container ─── */
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalContainer: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-aviation-900 border border-aviation-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-aviation-800 bg-aviation-850/60">
          <h3 className="text-sm font-display font-bold text-white tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-aviation-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

/* ─── 1. Confirm Booking Modal ─── */
interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRecord;
  isLoading: boolean;
}

export const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading,
}) => (
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Confirm Booking">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-300 leading-relaxed">
          You are about to confirm booking{" "}
          <strong className="text-white font-mono">{booking.bookingRef}</strong> for passenger{" "}
          <strong className="text-white">{booking.passengerName}</strong>.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2 text-xs">
        <div className="bg-aviation-850/80 p-3 rounded-lg border border-aviation-800">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Flight / Route</span>
          <span className="text-white font-mono font-medium">
            {booking.flightNum || "—"} ({booking.originCode || "—"} → {booking.destCode || "—"})
          </span>
        </div>
        <div className="bg-aviation-850/80 p-3 rounded-lg border border-aviation-800">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Amount</span>
          <span className="text-aviation-gold font-mono font-bold">
            {formatCurrencyINR(booking.totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Keep Current State
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Confirm Booking
        </button>
      </div>
    </div>
  </ModalContainer>
);

/* ─── 2. Cancel Booking Modal ─── */
interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRecord;
  isLoading: boolean;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading,
}) => (
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Cancel Booking">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-300 leading-relaxed">
          <strong className="block text-red-200 font-semibold mb-0.5">
            Destructive Action Warning
          </strong>
          Cancellation cannot be casually reversed. This will move booking{" "}
          <strong className="text-white font-mono">{booking.bookingRef}</strong> to{" "}
          <strong className="text-red-300">CANCELLED</strong> status.
        </div>
      </div>

      <div className="bg-aviation-850/80 p-3.5 rounded-lg border border-aviation-800 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Passenger:</span>
          <span className="text-white font-medium">{booking.passengerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="text-white font-mono">{booking.passengerEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Service:</span>
          <span className="text-slate-300">{booking.serviceType}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Keep Booking
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Cancel Booking
        </button>
      </div>
    </div>
  </ModalContainer>
);

/* ─── 3. Advance Status Modal ─── */
interface AdvanceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRecord;
  targetStatus: BookingStatusType;
  isLoading: boolean;
}

export const AdvanceStatusModal: React.FC<AdvanceStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  targetStatus,
  isLoading,
}) => {
  const isComplete = targetStatus === "COMPLETED";

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={isComplete ? "Complete Service" : "Move to In Progress"}
    >
      <div className="space-y-4">
        <div
          className={`flex items-start gap-3 rounded-xl p-3.5 border ${
            isComplete
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300"
          }`}
        >
          <CheckCircle2
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isComplete ? "text-emerald-400" : "text-sky-400"
            }`}
          />
          <div className="text-xs leading-relaxed">
            Transition booking <strong className="text-white font-mono">{booking.bookingRef}</strong>{" "}
            from <strong className="text-slate-200">{booking.status}</strong> to{" "}
            <strong className="text-white font-bold">{targetStatus}</strong>.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isComplete
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30"
                : "bg-sky-600 hover:bg-sky-500 shadow-sm shadow-sky-600/30"
            }`}
          >
            {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {isComplete ? "Complete Service" : "Start Service"}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

/* ─── 4. Sync Payment Confirmation Modal ─── */
interface SyncPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingRef: string;
  isLoading: boolean;
}

export const SyncPaymentModal: React.FC<SyncPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingRef,
  isLoading,
}) => (
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Reconcile & Synchronize Payment">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-aviation-800/60 border border-aviation-700 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
        <RefreshCw className="h-4 w-4 text-aviation-gold flex-shrink-0 mt-0.5" />
        <div>
          This action queries the live Razorpay payment gateway for booking{" "}
          <strong className="text-white font-mono">{bookingRef}</strong> and synchronizes the local database
          if verified payment funds exist.
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-aviation-950 bg-aviation-gold hover:bg-amber-400 rounded-lg shadow-sm shadow-aviation-gold/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Sync Now
        </button>
      </div>
    </div>
  </ModalContainer>
);

/* ─── 5. Move to recycle bin ─── */
interface RecycleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRecord;
  isLoading: boolean;
}

export const RecycleBookingModal: React.FC<RecycleBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading,
}) => (
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Move booking to bin">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          Booking <strong className="text-white font-mono">{booking.bookingRef}</strong> will leave the live
          list and move to the recycle bin. You can restore it later. Permanent deletion is Super Admin only.
        </div>
      </div>
      <div className="bg-aviation-850/80 p-3.5 rounded-lg border border-aviation-800 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Passenger:</span>
          <span className="text-white font-medium">{booking.passengerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="text-white font-mono">{booking.passengerEmail}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg disabled:opacity-50"
        >
          Keep on dashboard
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-600 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Move to bin
        </button>
      </div>
    </div>
  </ModalContainer>
);

/* ─── 6. Permanent delete ─── */
interface PurgeBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingRecord;
  isLoading: boolean;
}

export const PurgeBookingModal: React.FC<PurgeBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading,
}) => (
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Permanently delete booking">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-300 leading-relaxed">
          This removes <strong className="text-white font-mono">{booking.bookingRef}</strong> from the
          database, including related payments and notifications. This cannot be undone.
        </div>
      </div>
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-aviation-800 hover:bg-aviation-700 border border-aviation-700 rounded-lg disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Delete forever
        </button>
      </div>
    </div>
  </ModalContainer>
);
