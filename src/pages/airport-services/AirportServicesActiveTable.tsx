import React from "react";
import {
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  ListChecks,
  Edit3,
  Eye,
  Trash2,
} from "lucide-react";
import { AirportServiceItem } from "../../api/airportServices";

export interface AirportServicesActiveTableProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  filteredServices: AirportServiceItem[];
  canEdit: boolean;
  isSuperAdmin: boolean;
  onOpenEdit: (item: AirportServiceItem) => void;
  onToggleAvailability: (item: AirportServiceItem) => void;
  onSetItemToRecycle: (item: AirportServiceItem) => void;
}

export const AirportServicesActiveTable: React.FC<AirportServicesActiveTableProps> = ({
  isLoading,
  error,
  onRetry,
  filteredServices,
  canEdit,
  isSuperAdmin,
  onOpenEdit,
  onToggleAvailability,
  onSetItemToRecycle,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-lime-600" />
          <p className="text-xs font-medium text-slate-500">Loading authoritative pricing catalog...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-4 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Retry
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <SlidersHorizontal className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No airport service mappings match your filter.</p>
          <p className="text-xs text-slate-500 mt-1">
            Try selecting "All Airports" or adjusting the Journey filter.
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
                <th className="py-3 px-4">Terminal</th>
                <th className="py-3 px-4">Notice Cutoff</th>
                <th className="py-3 px-4 text-right">Active Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-lime-50/20 transition-colors group text-slate-700"
                >
                  {/* Airport Hub */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {item.airport_code}
                      </span>
                      <span className="text-slate-500 truncate max-w-[140px]" title={item.city}>
                        {item.city}
                      </span>
                    </div>
                  </td>

                  {/* Service Package */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-lime-700 transition-colors">
                        {item.service_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        slug: {item.service_slug}
                      </div>
                      {/* Inclusions Counter Pill */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-lime-50 text-slate-600 hover:text-lime-800 border border-slate-200 hover:border-lime-300 transition-all cursor-pointer"
                          title={
                            (item.features?.length || (item.inclusions?.length ?? 0)) > 0
                              ? `Inclusions (${item.features?.length || item.inclusions?.length}):\n• ${(item.features || item.inclusions || []).join("\n• ")}`
                              : "No inclusions set (Click to configure)"
                          }
                        >
                          <ListChecks className="h-3 w-3 text-lime-600" />
                          <span>{(item.features?.length || item.inclusions?.length) || 0} Inclusions</span>
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Route Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.journey_type === "DEPARTURE"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : item.journey_type === "ARRIVAL"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {item.journey_type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.flight_type === "ALL" ? "Dom + Int'l" : item.flight_type}
                      </span>
                    </div>
                  </td>

                  {/* Terminal */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-mono text-[11px] font-medium">{item.terminal || "All"}</span>
                  </td>

                  {/* Notice Cutoff */}
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {item.min_booking_notice_hours ? `${item.min_booking_notice_hours} hrs` : "Standard"}
                  </td>

                  {/* Active Price */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">{item.currency || "INR"}</div>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border ${
                        item.is_available
                          ? "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                      title={canEdit ? "Click to toggle active status" : "Current active status"}
                      disabled={!canEdit}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.is_available ? "bg-lime-600" : "bg-rose-500"
                        }`}
                      />
                      {item.is_available ? "Active" : "Disabled"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Edit Price & Inclusions (Admin & Super Admin) */}
                      <button
                        onClick={() => onOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        title={canEdit ? "Edit price, terminal & inclusions" : "View service details & inclusions"}
                      >
                        {canEdit ? (
                          <>
                            <Edit3 className="h-3 w-3 text-slate-500" />
                            <span>Edit</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 text-slate-500" />
                            <span>View</span>
                          </>
                        )}
                      </button>

                      {/* Delete / Move to Recycle Bin (Super Admin Only) */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => onSetItemToRecycle(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          title="Move to Recycle Bin (Super Admin only)"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

