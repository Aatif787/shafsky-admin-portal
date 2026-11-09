import React from "react";
import { Search, X } from "lucide-react";
import { SUPPORTED_AIRPORTS } from "./types";

export interface AirportServicesFiltersProps {
  selectedAirport: string;
  setSelectedAirport: (val: string) => void;
  selectedJourney: string;
  setSelectedJourney: (val: string) => void;
  selectedFlightType: string;
  setSelectedFlightType: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredCount: number;
  totalCount: number;
}

export const AirportServicesFilters: React.FC<AirportServicesFiltersProps> = ({
  selectedAirport,
  setSelectedAirport,
  selectedJourney,
  setSelectedJourney,
  selectedFlightType,
  setSelectedFlightType,
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Airport Selector */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Airport Hub
          </label>
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
          >
            {SUPPORTED_AIRPORTS.map((apt) => (
              <option key={apt.code} value={apt.code}>
                {apt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Journey Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Journey Type
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {["ALL", "DEPARTURE", "ARRIVAL", "TRANSIT"].map((jt) => (
              <button
                key={jt}
                type="button"
                onClick={() => setSelectedJourney(jt)}
                className={`py-1 rounded-md text-center font-semibold transition-all ${
                  selectedJourney === jt
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {jt === "ALL" ? "All" : jt.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Type Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Flight Scope
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {["ALL", "DOMESTIC", "INTERNATIONAL"].map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setSelectedFlightType(ft)}
                className={`py-1 rounded-md text-center font-semibold transition-all ${
                  selectedFlightType === ft
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {ft === "ALL" ? "All" : ft === "DOMESTIC" ? "Dom" : "Int'l"}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search package, city, slug..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{filteredCount}</strong> of{" "}
          <strong className="text-slate-800 font-semibold">{totalCount}</strong> services
        </span>
        <span className="text-[11px] text-slate-400 font-normal">
          GST Inclusive • Per Passenger Rates
        </span>
      </div>
    </div>
  );
};

