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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
      <div className="flex items-start gap-3 bg-lime-50 border border-lime-200 rounded-xl p-3.5">
        <CheckCircle2 className="h-5 w-5 text-lime-600 shrink-0 mt-0.5" />
        <div className="text-xs text-lime-900 leading-relaxed font-medium">
          You are about to confirm booking{" "}
          <strong className="text-slate-900 font-mono font-bold">{booking.bookingRef}</strong> for passenger{" "}
          <strong className="text-slate-900">{booking.passengerName}</strong>.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-1 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Flight / Route</span>
          <span className="text-slate-900 font-mono font-semibold">
            {booking.flightNum || "—"} ({booking.originCode || "—"} → {booking.destCode || "—"})
          </span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Amount</span>
          <span className="text-lime-700 font-mono font-bold">
            {formatCurrencyINR(booking.totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Keep Current State
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-lime-600 hover:bg-lime-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
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
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-900 leading-relaxed font-medium">
          <strong className="block text-rose-900 font-bold mb-0.5">
            Destructive Action Warning
          </strong>
          Cancellation cannot be casually reversed. This will move booking{" "}
          <strong className="text-slate-900 font-mono font-bold">{booking.bookingRef}</strong> to{" "}
          <strong className="text-rose-700 font-bold">CANCELLED</strong> status.
        </div>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
        <div className="flex justify-between">
          <span className="text-slate-500">Passenger:</span>
          <span className="text-slate-900 font-semibold">{booking.passengerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="text-slate-900 font-mono">{booking.passengerEmail}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Service:</span>
          <span className="text-slate-700">{booking.serviceType}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Keep Booking
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
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
              ? "bg-lime-50 border-lime-200 text-lime-900"
              : "bg-sky-50 border-sky-200 text-sky-900"
          }`}
        >
          <CheckCircle2
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              isComplete ? "text-lime-600" : "text-sky-600"
            }`}
          />
          <div className="text-xs leading-relaxed font-medium">
            Transition booking <strong className="text-slate-900 font-mono font-bold">{booking.bookingRef}</strong>{" "}
            from <strong className="text-slate-700 font-semibold">{booking.status}</strong> to{" "}
            <strong className="text-slate-900 font-bold">{targetStatus}</strong>.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isComplete
                ? "bg-lime-600 hover:bg-lime-700 shadow-xs"
                : "bg-sky-600 hover:bg-sky-700 shadow-xs"
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
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
        <RefreshCw className="h-4 w-4 text-lime-600 shrink-0 mt-0.5" />
        <div>
          This action queries the live Razorpay payment gateway for booking{" "}
          <strong className="text-slate-900 font-mono font-bold">{bookingRef}</strong> and synchronizes the local database
          if verified payment funds exist.
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-lime-600 hover:bg-lime-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
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
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Move Booking to Bin">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs text-orange-900 leading-relaxed font-medium">
          Booking <strong className="text-slate-900 font-mono font-bold">{booking.bookingRef}</strong> will leave the live
          list and move to the recycle bin. You can restore it later. Permanent deletion is Super Admin only.
        </div>
      </div>
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
        <div className="flex justify-between">
          <span className="text-slate-500">Passenger:</span>
          <span className="text-slate-900 font-semibold">{booking.passengerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="text-slate-900 font-mono">{booking.passengerEmail}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50"
        >
          Keep on Dashboard
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Move to Bin
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
  <ModalContainer isOpen={isOpen} onClose={onClose} title="Permanently Delete Booking">
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3.5">
        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-900 leading-relaxed font-medium">
          This removes <strong className="text-slate-900 font-mono font-bold">{booking.bookingRef}</strong> from the
          database, including related payments and notifications. This cannot be undone.
        </div>
      </div>
      <div className="flex items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
        >
          {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          Delete Forever
        </button>
      </div>
    </div>
  </ModalContainer>
);
