import React from "react";
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
}

export const DashboardRecyclePanel: React.FC<DashboardRecyclePanelProps> = ({
  items,
  total,
  isLoading,
  isSuperAdmin,
  busyRef,
  onRestore,
  onPurge,
}) => {
  const navigate = useNavigate();

  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Recycle Bin</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isLoading ? "Loading…" : `${total.toLocaleString()} booking${total === 1 ? "" : "s"} in bin`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/bookings/bin")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-800 transition-colors"
        >
          <span>Open bin</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
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
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-3">
                    <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                  Recycle bin is empty.
                </td>
              </tr>
            ) : (
              items.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
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
                        disabled={busyRef === booking.bookingRef}
                        onClick={() => onRestore(booking)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                        Restore
                      </button>
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          disabled={busyRef === booking.bookingRef}
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
