/**
 * CharterFilters — Phase 19B
 * Search (debounced 300ms) and filter controls for Private Charter Desk.
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import type { CharterPriority } from "../../types/charter";

interface CharterFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  priority: CharterPriority | "ALL";
  onPriorityChange: (val: CharterPriority | "ALL") => void;
  totalCount: number;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "REQUESTED", label: "New Request" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "AIRCRAFT_SEARCH", label: "Aircraft Search" },
  { value: "OPTIONS_PREPARED", label: "Options Prepared" },
  { value: "QUOTE_SENT", label: "Quote Sent" },
  { value: "CUSTOMER_REVIEW", label: "Customer Review" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "URGENT", label: "Urgent (Within 48h)" },
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "STANDARD", label: "Standard" },
];

export const CharterFilters: React.FC<CharterFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  totalCount,
}) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearchChange("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Search by reference (SC-XXXX), customer, company, phone, route..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all font-mono shadow-xs"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-lime-500 shadow-xs transition-colors cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as CharterPriority | "ALL")}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-lime-500 shadow-xs transition-colors cursor-pointer"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Counter indicator */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{totalCount}</strong> charter enquiries
        </span>
        {(status !== "ALL" || priority !== "ALL" || search) && (
          <button
            onClick={() => {
              handleClearSearch();
              onStatusChange("ALL");
              onPriorityChange("ALL");
            }}
            className="text-orange-600 hover:text-orange-800 font-semibold text-xs transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
