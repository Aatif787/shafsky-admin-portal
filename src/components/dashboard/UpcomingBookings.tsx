import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { BookingStatusBadge } from "../bookings/BookingStatusBadge";
import { formatCurrencyINR, formatOperationalDateTime } from "../../lib/dateUtils";

interface UpcomingBookingsProps {
  bookings: BookingRecord[];
  isLoading: boolean;
  canRecycle?: boolean;
  onRecycle?: (booking: BookingRecord) => void;
}

export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  bookings,
  isLoading,
  canRecycle = false,
  onRecycle,
}) => {
  const navigate = useNavigate();

  return (
    <section className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-aviation-800">
        <h3 className="text-[13px] font-semibold text-white">Recent bookings</h3>
        <button
          type="button"
          onClick={() => navigate("/bookings")}
          className="text-[11px] text-slate-400 hover:text-white"
        >
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-[12px]">
          <thead className="sticky top-0 bg-aviation-900 border-b border-aviation-800 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Booking</th>
              <th className="px-3 py-2 font-medium">Passenger</th>
              <th className="px-3 py-2 font-medium">Flight</th>
              <th className="px-3 py-2 font-medium">Route</th>
              <th className="px-3 py-2 font-medium">Travel date</th>
              <th className="px-3 py-2 font-medium">Service</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Payment</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Created</th>
              {canRecycle ? <th className="px-3 py-2 font-medium text-right"> </th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-aviation-800">
                  <td colSpan={canRecycle ? 11 : 10} className="px-3 py-2">
                    <div className="h-6 bg-aviation-850 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={canRecycle ? 11 : 10} className="px-4 py-8 text-center text-slate-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => navigate(`/bookings/${booking.bookingRef}`)}
                  className="border-b border-aviation-800/70 hover:bg-aviation-850 cursor-pointer"
                >
                  <td className="px-3 py-2 font-mono text-slate-200">{booking.bookingRef}</td>
                  <td className="px-3 py-2 text-white">{booking.passengerName}</td>
                  <td className="px-3 py-2 font-mono">{booking.flightNum || "—"}</td>
                  <td className="px-3 py-2 font-mono">
                    {booking.originCode || "—"} → {booking.destCode || "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {formatOperationalDateTime(booking.departureTime || booking.createdAt)}
                  </td>
                  <td className="px-3 py-2">{booking.metadataJson?.package || booking.serviceType || "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{formatCurrencyINR(booking.totalAmount)}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {(booking.metadataJson?.payment_status || "—").toString()}
                  </td>
                  <td className="px-3 py-2">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-3 py-2 text-slate-500">{formatOperationalDateTime(booking.createdAt)}</td>
                  {canRecycle ? (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        title="Move to bin"
                        aria-label={`Move ${booking.bookingRef} to bin`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecycle?.(booking);
                        }}
                        className="inline-flex rounded p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
