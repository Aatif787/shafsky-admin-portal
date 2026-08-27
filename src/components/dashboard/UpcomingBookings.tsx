import React, { useState, useMemo } from "react";
import { Search, Plane } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { Badge } from "../ui/Badge";
import { formatCurrencyINR, formatOperationalDate, formatOperationalTime } from "../../lib/dateUtils";

interface UpcomingBookingsProps {
  bookings: BookingRecord[];
  isLoading: boolean;
}

export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== "ALL") {
        if ((b.status || "").toUpperCase() !== statusFilter) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const refMatch = (b.bookingRef || "").toLowerCase().includes(term);
        const nameMatch = (b.passengerName || "").toLowerCase().includes(term);
        const emailMatch = (b.passengerEmail || "").toLowerCase().includes(term);
        const flightMatch = (b.flightNum || "").toLowerCase().includes(term);
        const airportMatch =
          (b.originCode || "").toLowerCase().includes(term) ||
          (b.destCode || "").toLowerCase().includes(term) ||
          (b.metadataJson?.service_airport || "").toLowerCase().includes(term);

        return refMatch || nameMatch || emailMatch || flightMatch || airportMatch;
      }

      return true;
    });
  }, [bookings, statusFilter, searchTerm]);

  const getStatusBadgeVariant = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "CONFIRMED":
        return "emerald";
      case "PENDING":
        return "amber";
      case "COMPLETED":
        return "blue";
      case "CANCELLED":
        return "rose";
      default:
        return "slate";
    }
  };

  const getPaymentBadge = (booking: BookingRecord) => {
    const s = (booking.status || "").toUpperCase();
    const payStatus = (booking.metadataJson?.payment_status || "").toUpperCase();

    if (s === "CONFIRMED" || payStatus === "PAID" || payStatus === "SUCCESSFUL") {
      return <Badge variant="emerald" size="sm">PAID</Badge>;
    }
    if (s === "CANCELLED" || payStatus === "FAILED") {
      return <Badge variant="rose" size="sm">FAILED</Badge>;
    }
    return <Badge variant="amber" size="sm">PENDING</Badge>;
  };

  return (
    <div className="rounded-xl border border-aviation-800 bg-aviation-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-display font-semibold text-white">
            Recent & Upcoming Operations
          </h2>
          <p className="text-xs text-slate-400">
            Real-time flight passenger service roster and ground handling queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ref, passenger, flight..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-aviation-700/80 bg-aviation-950 text-xs text-white placeholder-slate-500 focus:border-aviation-gold focus:outline-none transition"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-aviation-950 p-1 rounded-lg border border-aviation-800 text-xs">
            {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                  statusFilter === status
                    ? "bg-aviation-800 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-aviation-800 bg-aviation-950/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-aviation-900/80 text-[10px] font-mono uppercase text-slate-400 border-b border-aviation-800">
            <tr>
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-4">Passenger</th>
              <th className="py-3 px-4">Flight / Route</th>
              <th className="py-3 px-4">Travel Date</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-850">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-3.5 w-20 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-28 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-24 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-20 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-24 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-16 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 w-14 bg-aviation-800 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-3.5 w-16 bg-aviation-800 rounded ml-auto" /></td>
                </tr>
              ))
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No bookings found matching current filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const flight = booking.flightNum || "—";
                const route = booking.originCode
                  ? `${booking.originCode} → ${booking.destCode || "—"}`
                  : booking.metadataJson?.service_airport || "Airport";
                const travelDate = formatOperationalDate(booking.departureTime || booking.arrivalTime);
                const travelTime = formatOperationalTime(booking.departureTime || booking.arrivalTime);
                const serviceLabel = booking.serviceType || booking.serviceCategory || "Meet & Assist";

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-aviation-900/40 transition group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white tracking-wider">
                      {booking.bookingRef}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">
                        {booking.passengerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {booking.passengerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Plane className="h-3 w-3 text-aviation-gold" />
                        {flight}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {route}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-300">{travelDate}</div>
                      {travelTime !== "—" && (
                        <div className="text-[10px] text-slate-500">{travelTime}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-slate-300 font-medium">
                        {serviceLabel.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {formatCurrencyINR(booking.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      {getPaymentBadge(booking)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={getStatusBadgeVariant(booking.status)} size="sm">
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
