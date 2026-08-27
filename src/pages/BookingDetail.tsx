/**
 * BookingDetail Page — Phase 19A
 * Full Operational Booking Management Console for SUPER_ADMIN & ADMIN Operators.
 * Supports status transitions, cancellation, Razorpay sync, and notification dispatch.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  fetchBookingDetail,
  updateBookingStatus,
  cancelBooking,
  syncBookingPayment,
  retryBookingNotifications,
} from "../api/bookings";
import type { BookingRecord } from "../types/dashboard";
import type { BookingStatusType } from "../types/booking";
import { BookingActionBar } from "../components/bookings/BookingActionBar";
import {
  ConfirmBookingModal,
  CancelBookingModal,
  AdvanceStatusModal,
  SyncPaymentModal,
} from "../components/bookings/BookingActionModals";
import { PaymentOperationsSection } from "../components/bookings/PaymentOperationsSection";
import { NotificationsSection } from "../components/bookings/NotificationsSection";
import {
  OverviewSection,
  CustomerSection,
  FlightSection,
  ServiceSection,
  NotesSection,
  MetadataSection,
} from "../components/bookings/BookingDetailSections";

export const BookingDetail: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Operational Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  // Modal Dialog States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [advanceTarget, setAdvanceTarget] = useState<BookingStatusType | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRetryingNotices, setIsRetryingNotices] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ─── Authoritative Load / Refetch ─── */
  const loadDetail = useCallback(async (silent = false) => {
    if (!bookingRef) return;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }

    const res = await fetchBookingDetail(bookingRef);

    if (!isMountedRef.current) return;

    if (res.error) {
      setError(res.error);
      if (!silent) setBooking(null);
    } else {
      setBooking(res.data);
      setIsConflict(false);
    }

    if (!silent) {
      setIsLoading(false);
    }
  }, [bookingRef]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  /* ─── Clear Notifications ─── */
  const clearBanners = () => {
    setActionSuccess(null);
    setActionError(null);
  };

  /* ─── 1. Confirm Booking Mutation ─── */
  const handleConfirmBooking = async () => {
    if (!booking || actionLoading) return;
    clearBanners();
    setActionLoading(true);

    const res = await updateBookingStatus(
      booking.bookingRef,
      "CONFIRMED",
      booking.version
    );

    if (!isMountedRef.current) return;
    setActionLoading(false);
    setShowConfirmModal(false);

    if (res.isConcurrencyConflict) {
      setIsConflict(true);
      setActionError(res.error);
      await loadDetail(true);
      return;
    }

    if (res.error) {
      setActionError(res.error);
    } else {
      setActionSuccess(`Booking ${booking.bookingRef} was successfully confirmed.`);
      await loadDetail(true);
    }
  };

  /* ─── 2. Cancel Booking Mutation ─── */
  const handleCancelBooking = async () => {
    if (!booking || actionLoading) return;
    clearBanners();
    setActionLoading(true);

    const res = await cancelBooking(booking.bookingRef, booking.version);

    if (!isMountedRef.current) return;
    setActionLoading(false);
    setShowCancelModal(false);

    if (res.isConcurrencyConflict) {
      setIsConflict(true);
      setActionError(res.error);
      await loadDetail(true);
      return;
    }

    if (res.error) {
      setActionError(res.error);
    } else {
      setActionSuccess(`Booking ${booking.bookingRef} has been cancelled.`);
      await loadDetail(true);
    }
  };

  /* ─── 3. Advance Status Mutation ─── */
  const handleAdvanceStatus = async () => {
    if (!booking || !advanceTarget || actionLoading) return;
    clearBanners();
    setActionLoading(true);

    const res = await updateBookingStatus(
      booking.bookingRef,
      advanceTarget,
      booking.version
    );

    if (!isMountedRef.current) return;
    setActionLoading(false);
    setAdvanceTarget(null);

    if (res.isConcurrencyConflict) {
      setIsConflict(true);
      setActionError(res.error);
      await loadDetail(true);
      return;
    }

    if (res.error) {
      setActionError(res.error);
    } else {
      setActionSuccess(
        `Booking ${booking.bookingRef} successfully updated to ${advanceTarget}.`
      );
      await loadDetail(true);
    }
  };

  /* ─── 4. Payment Gateway Reconciliation ─── */
  const handleSyncPayment = async () => {
    if (!booking || isSyncing) return;
    clearBanners();
    setIsSyncing(true);

    const res = await syncBookingPayment(booking.bookingRef);

    if (!isMountedRef.current) return;
    setIsSyncing(false);
    setShowSyncModal(false);

    if (res.error) {
      setActionError(res.error);
    } else if (res.data) {
      const msg =
        res.data.message ||
        (res.data.status === "CONFIRMED"
          ? "Payment verified on Razorpay. Booking confirmed."
          : `Gateway reconciliation complete. Status: ${res.data.status}`);
      setActionSuccess(msg);
      await loadDetail(true);
    }
  };

  /* ─── 5. Retry Notifications ─── */
  const handleRetryNotifications = async () => {
    if (!booking || isRetryingNotices) return;
    clearBanners();
    setIsRetryingNotices(true);

    const res = await retryBookingNotifications(booking.bookingRef);

    if (!isMountedRef.current) return;
    setIsRetryingNotices(false);

    if (res.error) {
      setActionError(res.error);
    } else {
      setActionSuccess(
        res.data?.message || `Notifications successfully queued for ${booking.bookingRef}.`
      );
      await loadDetail(true);
    }
  };

  /* ─── Loading State ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackButton onClick={() => navigate("/bookings")} />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-mono">
              Loading booking {bookingRef}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Initial Load Error State ─── */
  if (error || !booking) {
    return (
      <div className="space-y-6">
        <BackButton onClick={() => navigate("/bookings")} />
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-sm text-red-300 font-medium">Could not load booking</p>
            <p className="text-xs text-red-400/70 mt-1 font-mono">
              {bookingRef} — {error || "Record not found"}
            </p>
          </div>
          <button
            onClick={() => loadDetail()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Detail View ─── */
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/bookings")} />
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              {booking.bookingRef}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {booking.passengerName}
              {booking.flightNum ? ` · Flight ${booking.flightNum}` : ""}
            </p>
          </div>
        </div>

        {/* Reload button */}
        <button
          type="button"
          onClick={() => loadDetail(true)}
          disabled={actionLoading || isSyncing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-aviation-850 hover:bg-aviation-800 hover:text-white border border-aviation-800 transition-colors"
          title="Refresh latest state from server"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${actionLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Operational Feedback Banners */}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300 font-medium">{actionSuccess}</p>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-red-300 font-semibold">Action Failed</p>
              <p className="text-xs text-red-400/80 mt-0.5 font-mono">{actionError}</p>
              {isConflict && (
                <button
                  type="button"
                  onClick={() => loadDetail()}
                  className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 text-red-200 hover:bg-red-500/30 text-[11px] font-mono border border-red-500/30"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reload Authoritative Record
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. Contextual Action Bar */}
      <BookingActionBar
        booking={booking}
        onOpenConfirm={() => {
          clearBanners();
          setShowConfirmModal(true);
        }}
        onOpenCancel={() => {
          clearBanners();
          setShowCancelModal(true);
        }}
        onOpenAdvance={(target) => {
          clearBanners();
          setAdvanceTarget(target);
        }}
        isLoading={actionLoading}
      />

      {/* 2. Overview Card */}
      <OverviewSection booking={booking} />

      {/* 3. Customer & Payment Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomerSection booking={booking} />
        <PaymentOperationsSection
          booking={booking}
          onOpenSync={() => {
            clearBanners();
            setShowSyncModal(true);
          }}
          isSyncing={isSyncing}
        />
      </div>

      {/* 4. Flight Information */}
      <FlightSection booking={booking} />

      {/* 5. Service Details */}
      <ServiceSection booking={booking} />

      {/* 6. Communications & Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NotificationsSection
          booking={booking}
          onRetryNotifications={handleRetryNotifications}
          isRetrying={isRetryingNotices}
        />
        <NotesSection booking={booking} />
      </div>

      {/* 7. Metadata Audit Card */}
      <MetadataSection booking={booking} />

      {/* ─── Modal Dialogs ─── */}
      <ConfirmBookingModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        booking={booking}
        isLoading={actionLoading}
      />

      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        booking={booking}
        isLoading={actionLoading}
      />

      {advanceTarget && (
        <AdvanceStatusModal
          isOpen={Boolean(advanceTarget)}
          onClose={() => setAdvanceTarget(null)}
          onConfirm={handleAdvanceStatus}
          booking={booking}
          targetStatus={advanceTarget}
          isLoading={actionLoading}
        />
      )}

      <SyncPaymentModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSyncPayment}
        bookingRef={booking.bookingRef}
        isLoading={isSyncing}
      />
    </div>
  );
};

/* ─── Back Button ─── */
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-aviation-850 hover:bg-aviation-800 hover:text-white border border-aviation-800 transition-colors cursor-pointer"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    Bookings
  </button>
);
