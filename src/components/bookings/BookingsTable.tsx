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
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Booking</th>
              <th className="px-4 py-3 font-semibold">Passenger</th>
              <th className="px-4 py-3 font-semibold">Flight</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Travel date</th>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              {canRecycle ? <th className="px-3 py-3 font-semibold text-right"> </th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && bookings.length === 0 ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i}>
                  <td colSpan={canRecycle ? 11 : 10} className="px-4 py-3">
                    <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
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
                  className="hover:bg-lime-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800 group-hover:text-lime-700 transition-colors">
                    {booking.bookingRef}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{booking.passengerName}</div>
                    <div className="text-[11px] text-slate-500">{booking.passengerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 font-medium">{booking.flightNum || "—"}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {booking.originCode || "—"} → {booking.destCode || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatOperationalDateTime(booking.departureTime || booking.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {booking.metadataJson?.package || booking.serviceType || "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-slate-900">
                    {formatCurrencyINR(booking.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {(booking.metadataJson?.payment_status || "—").toString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {formatOperationalDateTime(booking.createdAt)}
                  </td>
                  {canRecycle ? (
                    <td className="px-3 py-3 text-right">
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-600 font-medium">
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
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
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
                  className={`min-w-[30px] h-7 rounded-lg text-xs font-semibold transition-all ${
                    pageNum === currentPage
                      ? "bg-lime-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200"
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
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
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
