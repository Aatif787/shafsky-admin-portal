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

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All services" },
  { value: "Airport Assistance", label: "Airport Assistance" },
  { value: "Ground Transport", label: "Ground Transport" },
  { value: "Travel Support", label: "Travel Support / Hotels" },
  { value: "Medical Assistance", label: "Medical Assistance" },
  { value: "Cargo & Logistics", label: "Cargo & Logistics" },
  { value: "Private Charter", label: "Private Charter (bookings)" },
];

const STATUS_OPTIONS: { value: BookingStatusType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const EMPTY_FILTERS: BookingListFilters = {
  status: "ALL",
  search: "",
  serviceCategory: "ALL",
  dateFrom: "",
  dateTo: "",
};

const selectClass =
  "appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none transition-all cursor-pointer hover:border-slate-300";

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isLoading
              ? "Loading records…"
              : `${totalCount.toLocaleString()} total record${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking ref, passenger, email, phone, flight, airport…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none transition-all"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
