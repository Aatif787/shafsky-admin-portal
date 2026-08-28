import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { fetchDashboardData } from "../api/dashboard";
import { fetchRecycleBin, recycleBooking, restoreBooking, purgeBooking } from "../api/bookings";
import type { DashboardData, BookingRecord } from "../types/dashboard";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { AttentionPanel } from "../components/dashboard/AttentionPanel";
import { UpcomingBookings } from "../components/dashboard/UpcomingBookings";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { DashboardRecyclePanel } from "../components/dashboard/DashboardRecyclePanel";
import { RecycleBookingModal, PurgeBookingModal } from "../components/bookings/BookingActionModals";
import { useAuth } from "../auth/useAuth";

export const Dashboard: React.FC = () => {
  const { role } = useAuth();
  const canManageBin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [binItems, setBinItems] = useState<BookingRecord[]>([]);
  const [binTotal, setBinTotal] = useState(0);
  const [binLoading, setBinLoading] = useState(false);
  const [binBusyRef, setBinBusyRef] = useState<string | null>(null);
  const [binNotice, setBinNotice] = useState<string | null>(null);
  const [binError, setBinError] = useState<string | null>(null);
  const [recycleTarget, setRecycleTarget] = useState<BookingRecord | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<BookingRecord | null>(null);
  const [recycleLoading, setRecycleLoading] = useState(false);

  const loadBin = useCallback(async () => {
    if (!canManageBin) return;
    setBinLoading(true);
    const res = await fetchRecycleBin({ page: 1, pageSize: 8 });
    if (res.error) {
      setBinError(res.error);
    } else if (res.data) {
      setBinItems(res.data.items);
      setBinTotal(res.data.total);
      setBinError(null);
    }
    setBinLoading(false);
  }, [canManageBin]);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);
    const result = await fetchDashboardData();
    if (result.error && !result.data) {
      setError("Unable to connect to operations service.");
    } else if (result.data) {
      setData(result.data);
      setError(null);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
    loadBin();
  }, [loadData, loadBin]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
      loadBin();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData, loadBin]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadData();
        loadBin();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadData, loadBin]);

  const handleRecycle = async () => {
    if (!recycleTarget || recycleLoading) return;
    setRecycleLoading(true);
    setBinError(null);
    const res = await recycleBooking(recycleTarget.bookingRef);
    setRecycleLoading(false);
    if (res.error) {
      setBinError(res.error);
      return;
    }
    setBinNotice(`${recycleTarget.bookingRef} moved to the recycle bin.`);
    setRecycleTarget(null);
    await Promise.all([loadData(true), loadBin()]);
  };

  const handleRestore = async (booking: BookingRecord) => {
    setBinBusyRef(booking.bookingRef);
    setBinNotice(null);
    setBinError(null);
    const res = await restoreBooking(booking.bookingRef);
    setBinBusyRef(null);
    if (res.error) {
      setBinError(res.error);
      return;
    }
    setBinNotice(`${booking.bookingRef} restored to live bookings.`);
    await Promise.all([loadData(true), loadBin()]);
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setBinBusyRef(purgeTarget.bookingRef);
    setBinNotice(null);
    setBinError(null);
    const res = await purgeBooking(purgeTarget.bookingRef);
    setBinBusyRef(null);
    if (res.error) {
      setBinError(res.error);
      return;
    }
    setBinNotice(`${purgeTarget.bookingRef} was permanently deleted.`);
    setPurgeTarget(null);
    await Promise.all([loadData(true), loadBin()]);
  };

  if (error && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md w-full border border-aviation-800 bg-aviation-900 p-6 text-center space-y-3">
          <AlertCircle className="h-6 w-6 text-rose-400 mx-auto" />
          <h2 className="text-sm font-semibold text-white">Unable to connect to operations service.</h2>
          <p className="text-[12px] text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              loadData(true);
              loadBin();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-200 hover:bg-aviation-850"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <DashboardHeader
        lastUpdated={data?.lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          loadData(true);
          loadBin();
        }}
      />
      <SummaryCards
        metrics={data?.metrics}
        isLoading={isLoading}
        binCount={canManageBin ? binTotal : null}
      />
      {canManageBin && binNotice && (
        <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-md px-3 py-2 text-[12px] text-emerald-200">
          {binNotice}
        </div>
      )}
      {canManageBin && binError && (
        <div className="border border-rose-900/60 bg-rose-950/30 rounded-md px-3 py-2 text-[12px] text-rose-200">
          {binError}
        </div>
      )}
      <AttentionPanel items={data?.attentionItems || []} isLoading={isLoading} />
      <UpcomingBookings
        bookings={data?.recentBookings || []}
        isLoading={isLoading}
        canRecycle={canManageBin}
        onRecycle={(booking) => {
          setBinError(null);
          setRecycleTarget(booking);
        }}
      />
      {canManageBin && (
        <DashboardRecyclePanel
          items={binItems}
          total={binTotal}
          isLoading={binLoading}
          isSuperAdmin={isSuperAdmin}
          busyRef={binBusyRef}
          onRestore={handleRestore}
          onPurge={(booking) => setPurgeTarget(booking)}
        />
      )}
      <RecentActivity logs={data?.auditLogs || []} isLoading={isLoading} />

      {recycleTarget && (
        <RecycleBookingModal
          isOpen={Boolean(recycleTarget)}
          onClose={() => setRecycleTarget(null)}
          onConfirm={handleRecycle}
          booking={recycleTarget}
          isLoading={recycleLoading}
        />
      )}
      {purgeTarget && (
        <PurgeBookingModal
          isOpen={Boolean(purgeTarget)}
          onClose={() => setPurgeTarget(null)}
          onConfirm={handlePurge}
          booking={purgeTarget}
          isLoading={binBusyRef === purgeTarget.bookingRef}
        />
      )}
    </div>
  );
};
