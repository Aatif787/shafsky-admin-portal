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
    setNotice(`${booking.bookingRef} restored to the live bookings list.`);
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
    setNotice(`${purgeTarget.bookingRef} was permanently deleted from the database.`);
    setPurgeTarget(null);
    await loadBin(page, debouncedSearch);
    if (isSuperAdmin) await loadLog(logPage);
  };

  if (!canManage) {
    return (
      <div className="border border-aviation-800 bg-aviation-900 rounded-md p-6 text-center">
        <p className="text-[13px] text-white">Recycle bin is available to Admin and Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Recycle bin</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Bookings removed from the live list. Restore returns them. Permanent delete is Super Admin only.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadBin(page, debouncedSearch)}
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-aviation-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bin by ref, passenger, or email"
          className="w-full rounded-md border border-aviation-800 bg-aviation-900 py-2 pl-9 pr-3 text-[12px] text-white placeholder-slate-500 outline-none"
        />
      </div>

      {notice && (
        <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-md px-3 py-2 text-[12px] text-emerald-200">
          {notice}
        </div>
      )}
      {error && (
        <div className="border border-rose-900/60 bg-rose-950/30 rounded-md p-3 flex items-start gap-2 text-[12px] text-rose-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead className="bg-aviation-900 border-b border-aviation-800 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Booking</th>
                <th className="px-3 py-2 font-medium">Passenger</th>
                <th className="px-3 py-2 font-medium">Moved to bin</th>
                {isSuperAdmin ? <th className="px-3 py-2 font-medium">Deleted by</th> : null}
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-b border-aviation-800">
                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-3 py-2">
                      <div className="h-6 bg-aviation-850 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-12 text-center text-slate-500">
                    Recycle bin is empty.
                  </td>
                </tr>
              ) : (
                items.map((booking) => (
                  <tr key={booking.id} className="border-b border-aviation-800/70">
                    <td className="px-3 py-2 font-mono text-slate-200">{booking.bookingRef}</td>
                    <td className="px-3 py-2">
                      <div className="text-white">{booking.passengerName}</div>
                      <div className="text-[11px] text-slate-500">{booking.passengerEmail}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {formatOperationalDateTime(booking.deletedAt)}
                    </td>
                    {isSuperAdmin ? (
                      <td className="px-3 py-2">
                        <div className="text-white">{booking.deletedByEmail || "—"}</div>
                        <div className="text-[11px] text-slate-500">
                          {booking.deletedByRole || "—"}
                          {booking.deletedByUserId ? ` · ${booking.deletedByUserId}` : ""}
                        </div>
                      </td>
                    ) : null}
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={busyRef === booking.bookingRef}
                          onClick={() => handleRestore(booking)}
                          className="inline-flex items-center gap-1 rounded-md border border-aviation-800 px-2 py-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-50"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </button>
                        {isSuperAdmin ? (
                          <button
                            type="button"
                            disabled={busyRef === booking.bookingRef}
                            onClick={() => setPurgeTarget(booking)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-900/60 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-950/40 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
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
        <div className="px-3 py-2.5 border-t border-aviation-800 text-[12px] text-slate-500">
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : "No records"}
          {totalPages > 1 && (
            <span className="ml-3">
              <button
                type="button"
                className="text-slate-300 hover:text-white disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="mx-2">{page}/{totalPages}</span>
              <button
                type="button"
                className="text-slate-300 hover:text-white disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </span>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Deletion activity</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Super Admin view of who moved, restored, or permanently deleted a booking.
            </p>
          </div>
          {logError && (
            <div className="text-[12px] text-rose-300">{logError}</div>
          )}
          <div className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
            <table className="w-full text-left text-[12px]">
              <thead className="border-b border-aviation-800 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">Booking</th>
                  <th className="px-3 py-2 font-medium">Actor</th>
                </tr>
              </thead>
              <tbody>
                {logLoading && logItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-slate-500">Loading…</td>
                  </tr>
                ) : logItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                      No recycle-bin activity yet.
                    </td>
                  </tr>
                ) : (
                  logItems.map((row) => (
                    <tr key={row.id} className="border-b border-aviation-800/70">
                      <td className="px-3 py-2 text-slate-400">{formatOperationalDateTime(row.createdAt)}</td>
                      <td className="px-3 py-2 text-white">{actionLabel(row.action)}</td>
                      <td className="px-3 py-2">
                        <div className="font-mono text-slate-200">{row.bookingRef || "—"}</div>
                        <div className="text-[11px] text-slate-500">{row.passengerName || ""}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-white">{row.actorEmail || "—"}</div>
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
            <div className="px-3 py-2.5 border-t border-aviation-800 text-[12px] text-slate-500">
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
