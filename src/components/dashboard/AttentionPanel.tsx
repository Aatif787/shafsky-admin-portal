import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { BookingStatusBadge } from "../bookings/BookingStatusBadge";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface AttentionPanelProps {
  items: BookingRecord[];
  isLoading: boolean;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ items, isLoading }) => {
  const navigate = useNavigate();

  const priorityOf = (booking: BookingRecord): "URGENT" | "ATTENTION" | "NORMAL" => {
    const status = (booking.status || "").toUpperCase();
    if (status === "PENDING") return "URGENT";
    if (status === "ASSIGNED" || status === "IN_PROGRESS") return "ATTENTION";
    return "NORMAL";
  };

  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-orange-50/40">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-900">Action Required</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
          {items.length} {items.length === 1 ? "record" : "records"}
        </span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-slate-500 font-medium">
          All bookings are up to date. No immediate action required.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="sticky top-0 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Priority</th>
                <th className="px-4 py-2.5 font-semibold">Booking</th>
                <th className="px-4 py-2.5 font-semibold">Passenger</th>
                <th className="px-4 py-2.5 font-semibold">Flight</th>
                <th className="px-4 py-2.5 font-semibold">Route</th>
                <th className="px-4 py-2.5 font-semibold">Travel</th>
                <th className="px-4 py-2.5 font-semibold">Service</th>
                <th className="px-4 py-2.5 font-semibold">Payment</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((booking) => {
                const priority = priorityOf(booking);
                const pay = (booking.metadataJson?.payment_status || "").toUpperCase();
                return (
                  <tr
                    key={booking.id}
                    onClick={() => navigate(`/bookings/${booking.bookingRef}`)}
                    className="hover:bg-orange-50/20 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          priority === "URGENT"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : priority === "ATTENTION"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
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
                    <td className="px-4 py-2.5 text-slate-600">{pay || "—"}</td>
                    <td className="px-4 py-2.5">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
