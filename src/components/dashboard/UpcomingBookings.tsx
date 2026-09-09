import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
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
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Recent Bookings</h3>
        <button
          type="button"
          onClick={() => navigate("/bookings")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-lime-700 hover:text-lime-800 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Booking</th>
              <th className="px-4 py-2.5 font-semibold">Passenger</th>
              <th className="px-4 py-2.5 font-semibold">Flight</th>
              <th className="px-4 py-2.5 font-semibold">Route</th>
              <th className="px-4 py-2.5 font-semibold">Travel date</th>
              <th className="px-4 py-2.5 font-semibold">Service</th>
              <th className="px-4 py-2.5 font-semibold">Amount</th>
              <th className="px-4 py-2.5 font-semibold">Payment</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Created</th>
              {canRecycle ? <th className="px-4 py-2.5 font-semibold text-right"> </th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={canRecycle ? 11 : 10} className="px-4 py-3">
                    <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
                  </td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={canRecycle ? 11 : 10} className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
                  No recent bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => navigate(`/bookings/${booking.bookingRef}`)}
                  className="hover:bg-lime-50/20 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-800 group-hover:text-lime-700 transition-colors">
                    {booking.bookingRef}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{booking.passengerName}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700 font-medium">{booking.flightNum || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">
                    {booking.originCode || "—"} → {booking.destCode || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {formatOperationalDateTime(booking.departureTime || booking.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">
                    {booking.metadataJson?.package || booking.serviceType || "—"}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums font-semibold text-slate-900">
                    {formatCurrencyINR(booking.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {(booking.metadataJson?.payment_status || "—").toString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-[11px]">
                    {formatOperationalDateTime(booking.createdAt)}
                  </td>
                  {canRecycle ? (
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        title="Move to bin"
                        aria-label={`Move ${booking.bookingRef} to bin`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecycle?.(booking);
                        }}
                        className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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
