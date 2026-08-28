import React from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
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
    <section className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-aviation-800">
        <div>
          <h3 className="text-[13px] font-semibold text-white">Recycle bin</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isLoading ? "Loading…" : `${total.toLocaleString()} booking${total === 1 ? "" : "s"} in bin`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/bookings/bin")}
          className="text-[11px] text-slate-400 hover:text-white"
        >
          Open bin
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[12px]">
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
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-aviation-800">
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-3 py-2">
                    <div className="h-6 bg-aviation-850 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 5 : 4} className="px-4 py-8 text-center text-slate-500">
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
                        onClick={() => onRestore(booking)}
                        className="inline-flex items-center gap-1 rounded-md border border-aviation-800 px-2 py-1 text-[11px] text-slate-300 hover:text-white disabled:opacity-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restore
                      </button>
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          disabled={busyRef === booking.bookingRef}
                          onClick={() => onPurge(booking)}
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
    </section>
  );
};
