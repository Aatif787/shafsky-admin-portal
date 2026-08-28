import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { formatOperationalDateTime, formatCurrencyINR } from "../../lib/dateUtils";

interface BookingsTableProps {
  bookings: BookingRecord[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  canRecycle?: boolean;
  onRecycle?: (booking: BookingRecord) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  isLoading,
  canRecycle = false,
  onRecycle,
}) => {
  const navigate = useNavigate();
  const startRecord = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-[12px]">
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
            {isLoading && bookings.length === 0 ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="border-b border-aviation-800">
                  <td colSpan={canRecycle ? 11 : 10} className="px-3 py-2">
                    <div className="h-6 bg-aviation-850 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : !isLoading && bookings.length === 0 ? (
              <tr>
                <td colSpan={canRecycle ? 11 : 10} className="px-4 py-12 text-center text-slate-500">
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
                  <td className="px-3 py-2">
                    <div className="text-white">{booking.passengerName}</div>
                    <div className="text-[11px] text-slate-500">{booking.passengerEmail}</div>
                  </td>
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 border-t border-aviation-800 text-[12px] text-slate-500">
        <div>
          {totalItems > 0
            ? `Showing ${startRecord}–${endRecord} of ${totalItems.toLocaleString()}`
            : "No records"}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded text-slate-400 hover:bg-aviation-800 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (currentPage <= 4) pageNum = i + 1;
              else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = currentPage - 3 + i;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  className={`min-w-[28px] h-7 rounded text-[12px] ${
                    pageNum === currentPage
                      ? "bg-aviation-800 text-white"
                      : "text-slate-400 hover:bg-aviation-850"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded text-slate-400 hover:bg-aviation-800 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
