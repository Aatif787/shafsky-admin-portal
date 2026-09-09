import React from "react";
import { useNavigate } from "react-router-dom";
import type { OperationsQueueItem } from "../../types/operations";
import { OperationsStatusBadge } from "./OperationsStatusBadge";
import { deriveOperationsPriority } from "../../api/operations";
import { formatOperationalDate } from "../../lib/dateUtils";

interface OperationsTableProps {
  items: OperationsQueueItem[];
  isLoading: boolean;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ items, isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Booking</th>
              <th className="px-4 py-3 font-semibold">Passenger</th>
              <th className="px-4 py-3 font-semibold">Flight</th>
              <th className="px-4 py-3 font-semibold">Airport</th>
              <th className="px-4 py-3 font-semibold">Terminal</th>
              <th className="px-4 py-3 font-semibold">Travel time</th>
              <th className="px-4 py-3 font-semibold">Services</th>
              <th className="px-4 py-3 font-semibold">Assigned officer</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td colSpan={10} className="px-4 py-3">
                    <div className="h-6 bg-slate-100 animate-pulse rounded-md" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-xs text-slate-500 font-medium">
                  No operations in the queue.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const priority = deriveOperationsPriority(item);
                const servicesStr =
                  item.selected_services
                    ?.map((s) => (typeof s === "string" ? s : s?.name || s?.service || "Service"))
                    .join(", ") || "—";
                return (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/operations/${encodeURIComponent(item.booking_reference)}`)}
                    className="hover:bg-lime-50/20 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          priority === "URGENT"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : priority === "ATTENTION"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800 group-hover:text-lime-700 transition-colors">
                      {item.booking_reference}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.customer_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 font-medium">{item.flight_number || "—"}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{item.airport_code}</td>
                    <td className="px-4 py-3 text-slate-600">{item.journey_type || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatOperationalDate(item.service_date)} {item.service_time}
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate text-slate-700 font-medium" title={servicesStr}>
                      {servicesStr}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {item.assigned_staff_name ? (
                        <span className="text-slate-900 font-semibold">{item.assigned_staff_name}</span>
                      ) : (
                        <span className="text-orange-600 font-medium text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <OperationsStatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
