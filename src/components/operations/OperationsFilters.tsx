/**
 * OperationsFilters — Phase 20
 * Filters & debounced search for Airport Ground Operations Queue.
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Calendar, MapPin, X } from "lucide-react";

interface OperationsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  airport: string;
  onAirportChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  serviceDate: string;
  onServiceDateChange: (val: string) => void;
  totalCount: number;
}

const AIRPORT_OPTIONS = [
  { value: "ALL", label: "All Airports" },
  { value: "DEL", label: "DEL — New Delhi" },
  { value: "BOM", label: "BOM — Mumbai" },
  { value: "HYD", label: "HYD — Hyderabad" },
  { value: "BLR", label: "BLR — Bengaluru" },
  { value: "AMD", label: "AMD — Ahmedabad" },
  { value: "LKO", label: "LKO — Lucknow" },
  { value: "CCU", label: "CCU — Kolkata" },
  { value: "MAA", label: "MAA — Chennai" },
  { value: "COK", label: "COK — Kochi" },
  { value: "GOI", label: "GOI — Goa" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Workflow States" },
  { value: "NEW", label: "NEW — Unassigned" },
  { value: "ASSIGNED", label: "ASSIGNED — Officer Ready" },
  { value: "IN_PROGRESS", label: "IN PROGRESS — Execution" },
  { value: "CUSTOMER_CONTACTED", label: "CUSTOMER CONTACTED" },
  { value: "READY", label: "READY — Airside Gate" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export const OperationsFilters: React.FC<OperationsFiltersProps> = ({
  search,
  onSearchChange,
  airport,
  onAirportChange,
  status,
  onStatusChange,
  serviceDate,
  onServiceDateChange,
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

  const isFiltered =
    search.trim() !== "" || airport !== "ALL" || status !== "ALL" || serviceDate.trim() !== "";

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Search reference (SHF-...), passenger, flight #, duty officer..."
            className="w-full bg-aviation-850 border border-aviation-700/60 rounded-lg pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aviation-gold focus:ring-1 focus:ring-aviation-gold transition-colors font-mono"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Airport Select */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-aviation-850 border border-aviation-700/60 rounded-lg px-2 py-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={airport}
              onChange={(e) => onAirportChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              {AIRPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-aviation-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1 bg-aviation-850 border border-aviation-700/60 rounded-lg px-2 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-aviation-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-aviation-850 border border-aviation-700/60 rounded-lg px-2 py-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => onServiceDateChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-mono"
            />
            {serviceDate && (
              <button
                onClick={() => onServiceDateChange("")}
                className="text-slate-400 hover:text-white text-xs"
                title="Clear date"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Counter & Reset */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-aviation-800/60">
        <span>
          Active operations: <strong className="text-white">{totalCount}</strong> services
        </span>

        {isFiltered && (
          <button
            onClick={() => {
              handleClearSearch();
              onAirportChange("ALL");
              onStatusChange("ALL");
              onServiceDateChange("");
            }}
            className="text-aviation-gold hover:underline text-[11px]"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
