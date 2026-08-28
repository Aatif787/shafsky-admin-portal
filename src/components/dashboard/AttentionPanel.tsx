import React from "react";
import { useNavigate } from "react-router-dom";
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
    <section className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-aviation-800">
        <h3 className="text-[13px] font-semibold text-white">Action required</h3>
        <span className="text-[11px] text-slate-500">{items.length} records</span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-aviation-850 animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-[13px] text-slate-500">No bookings require action.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead className="sticky top-0 bg-aviation-900 border-b border-aviation-800 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Booking</th>
                <th className="px-3 py-2 font-medium">Passenger</th>
                <th className="px-3 py-2 font-medium">Flight</th>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Travel</th>
                <th className="px-3 py-2 font-medium">Service</th>
                <th className="px-3 py-2 font-medium">Payment</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((booking) => {
                const priority = priorityOf(booking);
                const pay = (booking.metadataJson?.payment_status || "").toUpperCase();
                return (
                  <tr
                    key={booking.id}
                    onClick={() => navigate(`/bookings/${booking.bookingRef}`)}
                    className="border-b border-aviation-800/70 hover:bg-aviation-850 cursor-pointer"
                  >
                    <td className="px-3 py-2">
                      <span
                        className={
                          priority === "URGENT"
                            ? "text-rose-400"
                            : priority === "ATTENTION"
                              ? "text-amber-400"
                              : "text-slate-500"
                        }
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-200">{booking.bookingRef}</td>
                    <td className="px-3 py-2 text-white">{booking.passengerName}</td>
                    <td className="px-3 py-2 font-mono">{booking.flightNum || "—"}</td>
                    <td className="px-3 py-2 font-mono">
                      {booking.originCode || "—"} → {booking.destCode || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {formatOperationalDateTime(booking.departureTime || booking.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {booking.metadataJson?.package || booking.serviceType || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{pay || "—"}</td>
                    <td className="px-3 py-2">
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
