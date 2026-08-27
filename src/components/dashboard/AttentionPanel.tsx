import React from "react";
import { AlertTriangle, CheckCircle2, Plane, Clock } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { Badge } from "../ui/Badge";
import { formatCurrencyINR, formatOperationalDate } from "../../lib/dateUtils";

interface AttentionPanelProps {
  items: BookingRecord[];
  isLoading: boolean;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-aviation-800 bg-aviation-900/60 p-5 space-y-4 animate-pulse">
        <div className="h-4 w-40 bg-aviation-800 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-aviation-850 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-aviation-900/50 p-4 sm:p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Attention Required Queue
          </h2>
        </div>
        <span className="text-[11px] font-mono text-amber-400/90 font-medium">
          {items.length} {items.length === 1 ? "Booking Needs Action" : "Bookings Need Action"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg border border-dashed border-aviation-800 bg-aviation-950/40">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 mb-2" />
          <div className="text-xs font-semibold text-slate-300">All Operations Clear</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            No bookings currently pending confirmation or payment resolution.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {items.map((booking) => {
            const flight = booking.flightNum || "—";
            const airport = booking.originCode
              ? `${booking.originCode} → ${booking.destCode || "—"}`
              : booking.metadataJson?.service_airport || "Airport";
            const travelDate = formatOperationalDate(booking.departureTime || booking.arrivalTime);

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg border border-aviation-800 bg-aviation-950/60 hover:border-amber-500/30 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-aviation-900 border border-aviation-800 text-amber-400 mt-0.5 shrink-0">
                    <Plane className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white tracking-wider">
                        {booking.bookingRef}
                      </span>
                      <Badge variant="amber" size="sm">
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-300 truncate font-medium mt-0.5">
                      {booking.passengerName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{flight}</span>
                      <span>•</span>
                      <span>{airport}</span>
                      <span>•</span>
                      <span>{travelDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-mono font-semibold text-white">
                    {formatCurrencyINR(booking.totalAmount)}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>Action Needed</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
