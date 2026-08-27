/**
 * BookingsTable — Phase 18.1
 * Authoritative Server-Side Paginated Table with Row Navigation.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PlaneTakeoff, Inbox } from "lucide-react";
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
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading && bookings.length === 0) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-mono">Loading bookings from server...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && bookings.length === 0) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aviation-800">
              <Inbox className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400">No bookings found</p>
            <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    );
  }

  const startRecord = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden relative">
      {/* Loading overlay for page transitions */}
      {isLoading && (
        <div className="absolute inset-0 bg-aviation-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center transition-opacity">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-aviation-900/90 border border-aviation-700 text-xs font-mono text-aviation-gold shadow-lg">
            <div className="h-3.5 w-3.5 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
            <span>Fetching page {currentPage}...</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-aviation-800 bg-aviation-900/80">
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Ref
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Passenger
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Flight
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Route
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Service
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-800/50">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => navigate(`/bookings/${booking.bookingRef}`)}
                className="group cursor-pointer hover:bg-aviation-850/80 transition-colors duration-100"
              >
                {/* Booking Ref */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-aviation-gold tracking-wide">
                    {booking.bookingRef}
                  </span>
                </td>

                {/* Passenger */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium truncate max-w-[180px]">
                      {booking.passengerName}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {booking.passengerEmail}
                    </span>
                  </div>
                </td>

                {/* Flight */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-slate-300">
                    {booking.flightNum || "—"}
                  </span>
                </td>

                {/* Route */}
                <td className="px-4 py-3">
                  {booking.originCode || booking.destCode ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="font-mono font-medium">{booking.originCode || "—"}</span>
                      <PlaneTakeoff className="h-3 w-3 text-slate-600" />
                      <span className="font-mono font-medium">{booking.destCode || "—"}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>

                {/* Service */}
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-300 capitalize">
                    {booking.metadataJson?.package || booking.serviceType || "—"}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-xs font-semibold text-white">
                    {formatCurrencyINR(booking.totalAmount)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <BookingStatusBadge status={booking.status} />
                </td>

                {/* Created */}
                <td className="px-4 py-3">
                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {formatOperationalDateTime(booking.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-aviation-800 bg-aviation-950/40">
        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-semibold">{startRecord}</span>–
          <span className="text-white font-semibold">{endRecord}</span> of{" "}
          <span className="text-white font-semibold">{totalItems.toLocaleString()}</span> bookings
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-aviation-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  className={`min-w-[28px] h-7 rounded-md text-xs font-mono transition-colors ${
                    pageNum === currentPage
                      ? "bg-aviation-gold text-aviation-950 font-bold"
                      : "text-slate-400 hover:bg-aviation-800 hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-aviation-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
