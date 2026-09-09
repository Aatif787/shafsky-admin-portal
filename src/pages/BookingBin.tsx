import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  fetchDeletionLog,
  fetchRecycleBin,
  purgeBooking,
  restoreBooking,
} from "../api/bookings";
import { PurgeBookingModal } from "../components/bookings/BookingActionModals";
import { useAuth } from "../auth/useAuth";
import type { BookingRecord } from "../types/dashboard";
import type { DeletionLogRecord } from "../types/booking";
import { formatOperationalDateTime } from "../lib/dateUtils";

const PAGE_SIZE = 25;

const actionLabel = (action: string) => {
  if (action === "BOOKING_RECYCLED") return "Moved to bin";
  if (action === "BOOKING_RESTORED") return "Restored";
  if (action === "BOOKING_PURGED") return "Permanently deleted";
  return action;
};

export const BookingBin: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const canManage = role === "ADMIN" || isSuperAdmin;

  const [items, setItems] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<BookingRecord | null>(null);

  const [logItems, setLogItems] = useState<DeletionLogRecord[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadBin = useCallback(async (nextPage: number, nextSearch: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    const res = await fetchRecycleBin(
      { page: nextPage, pageSize: PAGE_SIZE, search: nextSearch },
      controller.signal
    );
    if (controller.signal.aborted) return;
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setItems(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  }, []);

  const loadLog = useCallback(async (nextPage: number) => {
    if (!isSuperAdmin) return;
    setLogLoading(true);
    setLogError(null);
    const res = await fetchDeletionLog({ page: nextPage, pageSize: PAGE_SIZE });
    if (res.error) {
      setLogError(res.error);
    } else if (res.data) {
      setLogItems(res.data.items);
      setLogTotal(res.data.total);
    }
    setLogLoading(false);
  }, [isSuperAdmin]);

  useEffect(() => {
    loadBin(page, debouncedSearch);
    return () => abortRef.current?.abort();
  }, [page, debouncedSearch, loadBin]);

  useEffect(() => {
    loadLog(logPage);
  }, [logPage, loadLog]);

  const handleRestore = async (booking: BookingRecord) => {
    setBusyRef(booking.bookingRef);
    setNotice(null);
    setError(null);
    const res = await restoreBooking(booking.bookingRef);
    setBusyRef(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNotice(`${booking.bookingRef} restored.`);
    await loadBin(page, debouncedSearch);
    if (isSuperAdmin) await loadLog(logPage);
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    setBusyRef(purgeTarget.bookingRef);
    setNotice(null);
    setError(null);
    const res = await purgeBooking(purgeTarget.bookingRef);
    setBusyRef(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNotice(`${purgeTarget.bookingRef} was permanently deleted.`);
    setPurgeTarget(null);
    await loadBin(page, debouncedSearch);
    if (isSuperAdmin) await loadLog(logPage);
  };

  if (!canManage) {
    return (
      <div className="border border-slate-200 bg-white rounded-xl p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-700">Recycle bin is available to Admin and Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Recycle Bin</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Bookings removed from the live list. Restore returns them. Permanent delete is Super Admin only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadBin(page, debouncedSearch)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bin by ref, passenger, or email…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
        />
      </div>

      {notice && (
        <div className="border border-lime-200 bg-lime-50 rounded-xl px-4 py-3 text-xs font-semibold text-lime-800 shadow-xs flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-lime-600 hover:text-lime-800 font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-3 flex items-start gap-2 text-xs font-semibold text-rose-800 shadow-xs">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Booking</th>
                <th className="px-4 py-2.5 font-semibold">Passenger</th>
                <th className="px-4 py-2.5 font-semibold">Moved to bin</th>
                {isSuperAdmin ? <th className="px-4 py-2.5 font-semibold">Deleted by</th> : null}
                <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && items.length === 0 ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-3">
                      <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-12 text-center text-xs text-slate-500 font-medium">
                    Recycle bin is empty.
                  </td>
                </tr>
              ) : (
                items.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-800">{booking.bookingRef}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{booking.passengerName}</div>
                      <div className="text-[11px] text-slate-500">{booking.passengerEmail}</div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {formatOperationalDateTime(booking.deletedAt)}
                    </td>
                    {isSuperAdmin ? (
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900">{booking.deletedByEmail || "—"}</div>
                        <div className="text-[11px] text-slate-500">
                          {booking.deletedByRole || "—"}
                          {booking.deletedByUserId ? ` · ${booking.deletedByUserId}` : ""}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={busyRef === booking.bookingRef}
                          onClick={() => handleRestore(booking)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                          Restore
                        </button>
                        {isSuperAdmin ? (
                          <button
                            type="button"
                            disabled={busyRef === booking.bookingRef}
                            onClick={() => setPurgeTarget(booking)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all shadow-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete forever
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 font-medium flex items-center justify-between">
          <div>
            {total > 0
              ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
              : "No records"}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-slate-500">{page}/{totalPages}</span>
              <button
                type="button"
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Deletion Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Super Admin audit view of who moved, restored, or permanently deleted a booking.
            </p>
          </div>
          {logError && (
            <div className="text-xs font-medium text-rose-600">{logError}</div>
          )}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">When</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                  <th className="px-4 py-2.5 font-semibold">Booking</th>
                  <th className="px-4 py-2.5 font-semibold">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logLoading && logItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-slate-500">Loading…</td>
                  </tr>
                ) : logItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                      No recycle-bin activity yet.
                    </td>
                  </tr>
                ) : (
                  logItems.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-slate-600">{formatOperationalDateTime(row.createdAt)}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{actionLabel(row.action)}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-mono text-slate-900 font-semibold">{row.bookingRef || "—"}</div>
                        <div className="text-[11px] text-slate-500">{row.passengerName || ""}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-900">{row.actorEmail || "—"}</div>
                        <div className="text-[11px] text-slate-500">
                          {row.actorRole || "—"}
                          {row.actorId ? ` · ${row.actorId}` : ""}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-medium">
              {logTotal.toLocaleString()} event{logTotal === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}

      {purgeTarget && (
        <PurgeBookingModal
          isOpen={Boolean(purgeTarget)}
          onClose={() => setPurgeTarget(null)}
          onConfirm={handlePurge}
          booking={purgeTarget}
          isLoading={busyRef === purgeTarget.bookingRef}
        />
      )}
    </div>
  );
};
