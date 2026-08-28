import React from "react";
import { Search, X, RefreshCw } from "lucide-react";
import type { BookingListFilters, BookingStatusType } from "../../types/booking";

interface BookingsFiltersProps {
  filters: BookingListFilters;
  onFiltersChange: (filters: BookingListFilters) => void;
  totalCount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

const STATUS_OPTIONS: { value: BookingStatusType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All services" },
  { value: "Airport Assistance", label: "Airport Assistance" },
  { value: "Meet & Greet", label: "Meet & Greet" },
  { value: "Charter", label: "Charter" },
];

const EMPTY_FILTERS: BookingListFilters = {
  status: "ALL",
  search: "",
  serviceCategory: "ALL",
  dateFrom: "",
  dateTo: "",
};

const selectClass =
  "appearance-none rounded-md border border-aviation-800 bg-aviation-900 px-3 py-2 text-[12px] text-white focus:border-aviation-gold/50 focus:outline-none";

export const BookingsFilters: React.FC<BookingsFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  isLoading,
  onRefresh,
}) => {
  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.search.trim() !== "" ||
    filters.serviceCategory !== "ALL" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Bookings</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {isLoading
              ? "Loading records…"
              : `${totalCount.toLocaleString()} total record${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-aviation-900 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Booking ref, passenger, email, phone, flight, airport"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full rounded-md border border-aviation-800 bg-aviation-900 py-2 pl-9 pr-3 text-[12px] text-white placeholder-slate-500 focus:border-aviation-gold/50 focus:outline-none"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as BookingListFilters["status"],
            })
          }
          className={selectClass}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.serviceCategory}
          onChange={(e) => onFiltersChange({ ...filters, serviceCategory: e.target.value })}
          className={selectClass}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          className={selectClass}
          aria-label="Date from"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          className={selectClass}
          aria-label="Date to"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1.5 rounded-md border border-aviation-800 px-3 py-2 text-[12px] text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
