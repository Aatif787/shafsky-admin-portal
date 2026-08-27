/**
 * BookingsFilters — Phase 18.1
 * Search bar + status filter dropdown for the bookings list view.
 */

import React from "react";
import { Search, X, Filter } from "lucide-react";
import type { BookingListFilters, BookingStatusType } from "../../types/booking";

interface BookingsFiltersProps {
  filters: BookingListFilters;
  onFiltersChange: (filters: BookingListFilters) => void;
  totalCount: number;
  isLoading: boolean;
}

const STATUS_OPTIONS: { value: BookingStatusType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

export const BookingsFilters: React.FC<BookingsFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  isLoading,
}) => {
  const hasActiveFilters = filters.status !== "ALL" || filters.search.trim() !== "";

  const handleClear = () => {
    onFiltersChange({ status: "ALL", search: "" });
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Airport Bookings
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {isLoading
              ? "Updating..."
              : `${totalCount.toLocaleString()} total record${totalCount === 1 ? "" : "s"}${
                  hasActiveFilters ? " matching filters" : ""
                }`}
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ref, passenger, email, phone, flight, route..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-4 py-2.5 bg-aviation-850 border border-aviation-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-aviation-gold/50 focus:border-aviation-gold/50 transition-colors"
          />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as BookingListFilters["status"],
              })
            }
            className="appearance-none pl-9 pr-10 py-2.5 bg-aviation-850 border border-aviation-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-aviation-gold/50 focus:border-aviation-gold/50 transition-colors cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 bg-aviation-800/60 hover:bg-aviation-700 hover:text-white border border-aviation-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
