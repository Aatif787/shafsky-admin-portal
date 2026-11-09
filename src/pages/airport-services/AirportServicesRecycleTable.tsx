import React from "react";
import {
  Archive,
  Search,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { AirportServiceItem } from "../../api/airportServices";
import { formatOperationalDateTime } from "../../lib/dateUtils";

export interface AirportServicesRecycleTableProps {
  isRecycleLoading: boolean;
  recycleError: string | null;
  onRetry: () => void;
  filteredRecycledServices: AirportServiceItem[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  restoringId: string | null;
  onRestore: (item: AirportServiceItem) => void;
  onPurge: (item: AirportServiceItem) => void;
}

export const AirportServicesRecycleTable: React.FC<AirportServicesRecycleTableProps> = ({
  isRecycleLoading,
  recycleError,
  onRetry,
  filteredRecycledServices,
  searchQuery,
  setSearchQuery,
  restoringId,
  onRestore,
  onPurge,
}) => {
  return (
    <div className="space-y-4">
      {/* Recycle Bin Explainer Header */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
        <Archive className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-rose-950 text-sm">Services Recycle Bin</h3>
          <p className="mt-0.5 text-rose-800">
            Services in the Recycle Bin are completely removed from customer booking flows and airport availability.
            As a <strong>Super Admin</strong>, you can either restore them back to the active catalog or permanently purge them from the database.
          </p>
        </div>
      </div>

      {/* Search bar inside recycle bin */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search deleted packages by name, airport or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {filteredRecycledServices.length} deleted {filteredRecycledServices.length === 1 ? "service" : "services"}
        </span>
      </div>

      {/* Recycle Bin Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {isRecycleLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-rose-600" />
            <p className="text-xs font-medium text-slate-500">Loading recycled services...</p>
          </div>
        ) : recycleError ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{recycleError}</p>
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredRecycledServices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Archive className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Recycle Bin is empty.</p>
            <p className="text-xs text-slate-500 mt-1">
              No airport services have been moved to the recycle bin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Airport Hub</th>
                  <th className="py-3 px-4">Service Package</th>
                  <th className="py-3 px-4">Route Type</th>
                  <th className="py-3 px-4">Moved To Bin</th>
                  <th className="py-3 px-4">Deleted By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecycledServices.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-rose-50/20 transition-colors group text-slate-700"
                  >
                    {/* Airport Hub */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {item.airport_code}
                        </span>
                        <span className="text-slate-500 truncate max-w-[130px]">
                          {item.city}
                        </span>
                      </div>
                    </td>

                    {/* Service Package */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 line-through opacity-80">
                          {item.service_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          slug: {item.service_slug}
                        </div>
                      </div>
                    </td>

                    {/* Route Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.journey_type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.flight_type === "ALL" ? "Dom + Int'l" : item.flight_type}
                        </span>
                      </div>
                    </td>

                    {/* Deletion Date */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-[11px]">
                        {formatOperationalDateTime(item.deleted_at)}
                      </div>
                    </td>

                    {/* Deleted By */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium text-[11px]">
                          {item.deleted_by_email || "Super Admin"}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600">
                          {item.deleted_by_role || "SUPER_ADMIN"}
                        </span>
                      </div>
                    </td>

                    {/* Actions: Restore & Permanent Purge */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Restore Button */}
                        <button
                          type="button"
                          onClick={() => onRestore(item)}
                          disabled={restoringId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-xs hover:bg-lime-50 hover:text-lime-700 hover:border-lime-200 transition-colors disabled:opacity-50"
                          title="Restore service to active catalog"
                        >
                          <RotateCcw
                            className={`h-3 w-3 text-slate-500 ${
                              restoringId === item.id ? "animate-spin text-lime-600" : ""
                            }`}
                          />
                          <span>Restore</span>
                        </button>

                        {/* Permanent Purge Button */}
                        <button
                          type="button"
                          onClick={() => onPurge(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold shadow-xs hover:bg-rose-100 hover:text-rose-800 transition-colors"
                          title="Permanently remove from database"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Purge</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

