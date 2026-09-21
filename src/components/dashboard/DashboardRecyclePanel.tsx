import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trash2, ArrowRight } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface DashboardRecyclePanelProps {
  items: BookingRecord[];
  total: number;
  isLoading: boolean;
  isSuperAdmin: boolean;
  busyRef: string | null;
  onRestore: (booking: BookingRecord) => void;
  onPurge: (booking: BookingRecord) => void;
  onPurgeSelected?: (bookings: BookingRecord[]) => void;
  bulkBusy?: boolean;
}

export const DashboardRecyclePanel: React.FC<DashboardRecyclePanelProps> = ({
  items,
  total,
  isLoading,
  isSuperAdmin,
  busyRef,
  onRestore,
  onPurge,
  onPurgeSelected,
  bulkBusy = false,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [items]);

  const visibleRefs = useMemo(
    () => items.map((b) => b.bookingRef).filter(Boolean),
    [items]
  );

  const allVisibleSelected =
    visibleRefs.length > 0 && visibleRefs.every((ref) => selected.has(ref));
  const someVisibleSelected = visibleRefs.some((ref) => selected.has(ref));

  const toggleOne = (ref: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visibleRefs.forEach((ref) => next.delete(ref));
        return next;
      }
      const next = new Set(prev);
      visibleRefs.forEach((ref) => next.add(ref));
      return next;
    });
  };

  const selectedBookings = items.filter((b) => selected.has(b.bookingRef));
  const colSpan = (isSuperAdmin ? 5 : 4) + (isSuperAdmin ? 1 : 0);

  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50 gap-3 flex-wrap">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Recycle Bin</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isLoading ? "Loading…" : `${total.toLocaleString()} booking${total === 1 ? "" : "s"} in bin`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && selectedBookings.length > 0 && onPurgeSelected ? (
            <button
              type="button"
              disabled={bulkBusy || Boolean(busyRef)}
              onClick={() => onPurgeSelected(selectedBookings)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete selected ({selectedBookings.length})
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => navigate("/bookings/bin")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-800 transition-colors"
          >
            <span>Open bin</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {isSuperAdmin ? (
                <th className="px-3 py-2.5 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all visible bookings"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                    }}
                    onChange={toggleAllVisible}
                    disabled={items.length === 0 || bulkBusy}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-lime-600 focus:ring-lime-500/30"
                  />
                </th>
              ) : null}
              <th className="px-4 py-2.5 font-semibold">Booking</th>
              <th className="px-4 py-2.5 font-semibold">Passenger</th>
              <th className="px-4 py-2.5 font-semibold">Moved to bin</th>
              {isSuperAdmin ? <th className="px-4 py-2.5 font-semibold">Deleted by</th> : null}
              <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && items.length === 0 ? (
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={colSpan} className="px-4 py-3">
                    <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                  Recycle bin is empty.
                </td>
              </tr>
            ) : (
              items.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                  {isSuperAdmin ? (
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${booking.bookingRef}`}
                        checked={selected.has(booking.bookingRef)}
                        onChange={() => toggleOne(booking.bookingRef)}
                        disabled={bulkBusy || busyRef === booking.bookingRef}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-lime-600 focus:ring-lime-500/30"
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-800">{booking.bookingRef}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{booking.passengerName}</div>
                    <div className="text-[11px] text-slate-500">{booking.passengerEmail}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {formatOperationalDateTime(booking.deletedAt)}
                  </td>
                  {isSuperAdmin ? (
                    <td className="px-4 py-2.5">
                      <div className="text-slate-900 font-medium">{booking.deletedByEmail || "—"}</div>
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
                        disabled={busyRef === booking.bookingRef || bulkBusy}
                        onClick={() => onRestore(booking)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                        Restore
                      </button>
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          disabled={busyRef === booking.bookingRef || bulkBusy}
                          onClick={() => onPurge(booking)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all"
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
    </section>
  );
};
