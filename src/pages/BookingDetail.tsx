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
  recycleBooking,
} from "../api/bookings";
import type { BookingRecord } from "../types/dashboard";
import type { BookingStatusType } from "../types/booking";
import { BookingActionBar } from "../components/bookings/BookingActionBar";
import {
  ConfirmBookingModal,
  CancelBookingModal,
  AdvanceStatusModal,
  SyncPaymentModal,
  RecycleBookingModal,
} from "../components/bookings/BookingActionModals";
import { PaymentOperationsSection } from "../components/bookings/PaymentOperationsSection";
import { NotificationsSection } from "../components/bookings/NotificationsSection";
import {
  CustomerSection,
  FlightSection,
  ServiceSection,
  NotesSection,
  MetadataSection,
} from "../components/bookings/BookingDetailSections";
import { BookingStatusBadge } from "../components/bookings/BookingStatusBadge";
import { formatOperationalDateTime } from "../lib/dateUtils";
import { useAuth } from "../auth/useAuth";

export const BookingDetail: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canRecycle = role === "ADMIN" || role === "SUPER_ADMIN";

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [advanceTarget, setAdvanceTarget] = useState<BookingStatusType | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRetryingNotices, setIsRetryingNotices] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

    if (!silent) setIsLoading(false);
  }, [bookingRef]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const clearBanners = () => {
    setActionSuccess(null);
    setActionError(null);
  };

  const handleConfirmBooking = async () => {
    if (!booking || actionLoading) return;
    clearBanners();
    setActionLoading(true);
    const res = await updateBookingStatus(booking.bookingRef, "CONFIRMED", booking.version);
    if (!isMountedRef.current) return;
    setActionLoading(false);
    setShowConfirmModal(false);
    if (res.isConcurrencyConflict) {
      setIsConflict(true);
      setActionError(res.error);
      await loadDetail(true);
      return;
    }
    if (res.error) setActionError(res.error);
    else {
      setActionSuccess(`Booking ${booking.bookingRef} was confirmed.`);
      await loadDetail(true);
    }
  };

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
    if (res.error) setActionError(res.error);
    else {
      setActionSuccess(`Booking ${booking.bookingRef} has been cancelled.`);
      await loadDetail(true);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!booking || !advanceTarget || actionLoading) return;
    clearBanners();
    setActionLoading(true);
    const res = await updateBookingStatus(booking.bookingRef, advanceTarget, booking.version);
    if (!isMountedRef.current) return;
    setActionLoading(false);
    setAdvanceTarget(null);
    if (res.isConcurrencyConflict) {
      setIsConflict(true);
      setActionError(res.error);
      await loadDetail(true);
      return;
    }
    if (res.error) setActionError(res.error);
    else {
      setActionSuccess(`Booking ${booking.bookingRef} updated to ${advanceTarget}.`);
      await loadDetail(true);
    }
  };

  const handleSyncPayment = async () => {
    if (!booking || isSyncing) return;
    clearBanners();
    setIsSyncing(true);
    const res = await syncBookingPayment(booking.bookingRef);
    if (!isMountedRef.current) return;
    setIsSyncing(false);
    setShowSyncModal(false);
    if (res.error) setActionError(res.error);
    else if (res.data) {
      setActionSuccess(
        res.data.message ||
          (res.data.status === "CONFIRMED"
            ? "Payment verified on Razorpay. Booking confirmed."
            : `Gateway reconciliation complete. Status: ${res.data.status}`)
      );
      await loadDetail(true);
    }
  };

  const handleRetryNotifications = async () => {
    if (!booking || isRetryingNotices) return;
    clearBanners();
    setIsRetryingNotices(true);
    const res = await retryBookingNotifications(booking.bookingRef);
    if (!isMountedRef.current) return;
    setIsRetryingNotices(false);
    if (res.error) setActionError(res.error);
    else {
      setActionSuccess(res.data?.message || `Notifications queued for ${booking.bookingRef}.`);
      await loadDetail(true);
    }
  };

  const handleRecycle = async () => {
    if (!booking || actionLoading) return;
    clearBanners();
    setActionLoading(true);
    const res = await recycleBooking(booking.bookingRef);
    if (!isMountedRef.current) return;
    setActionLoading(false);
    setShowRecycleModal(false);
    if (res.error) {
      setActionError(res.error);
      return;
    }
    navigate("/bookings/bin");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate("/bookings")} className="text-[12px] text-slate-400 hover:text-white">
          ← Bookings
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-7 h-64 bg-aviation-900 border border-aviation-800 rounded-md animate-pulse" />
          <div className="lg:col-span-3 h-64 bg-aviation-900 border border-aviation-800 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate("/bookings")} className="text-[12px] text-slate-400 hover:text-white">
          ← Bookings
        </button>
        <div className="border border-rose-900/60 bg-rose-950/20 rounded-md p-6 text-center space-y-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 mx-auto" />
          <p className="text-[13px] text-white">Unable to load this booking.</p>
          <p className="text-[12px] text-slate-400">{error || "Record not found"}</p>
          <button
            type="button"
            onClick={() => loadDetail()}
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-200 border border-aviation-800 px-3 py-1.5 rounded-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pay = (booking.metadataJson?.payment_status || "—").toString();

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-aviation-800 pb-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-white mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Bookings
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg font-semibold font-mono text-white">{booking.bookingRef}</h1>
            <BookingStatusBadge status={booking.status} />
            <span className="text-[11px] text-slate-400">{pay}</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-1">
            {booking.passengerName}
            {booking.flightNum ? ` · ${booking.flightNum}` : ""}
            {booking.departureTime ? ` · ${formatOperationalDateTime(booking.departureTime)}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDetail(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-aviation-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {actionSuccess && (
        <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-md px-3 py-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <p className="text-[12px] text-emerald-200">{actionSuccess}</p>
          </div>
          <button type="button" onClick={() => setActionSuccess(null)} className="text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="border border-rose-900/50 bg-rose-950/20 rounded-md px-3 py-2 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5" />
            <div>
              <p className="text-[12px] text-rose-200">{actionError}</p>
              {isConflict && (
                <button type="button" onClick={() => loadDetail()} className="mt-1 text-[11px] text-slate-300 underline">
                  Reload latest record
                </button>
              )}
            </div>
          </div>
          <button type="button" onClick={() => setActionError(null)} className="text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-7 space-y-4">
          <CustomerSection booking={booking} />
          <FlightSection booking={booking} />
          <ServiceSection booking={booking} />
          <NotificationsSection
            booking={booking}
            onRetryNotifications={handleRetryNotifications}
            isRetrying={isRetryingNotices}
          />
          <NotesSection booking={booking} />
          <MetadataSection booking={booking} />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <PaymentOperationsSection
            booking={booking}
            onOpenSync={() => {
              clearBanners();
              setShowSyncModal(true);
            }}
            isSyncing={isSyncing}
          />
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
            onOpenRecycle={() => {
              clearBanners();
              setShowRecycleModal(true);
            }}
            canRecycle={canRecycle}
            isLoading={actionLoading}
          />
        </div>
      </div>

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
      <RecycleBookingModal
        isOpen={showRecycleModal}
        onClose={() => setShowRecycleModal(false)}
        onConfirm={handleRecycle}
        booking={booking}
        isLoading={actionLoading}
      />
    </div>
  );
};
