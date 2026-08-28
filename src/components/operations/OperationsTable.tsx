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
    <div className="border border-aviation-800 rounded-md overflow-hidden bg-aviation-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-[12px]">
          <thead className="sticky top-0 bg-aviation-900 border-b border-aviation-800 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Booking</th>
              <th className="px-3 py-2 font-medium">Passenger</th>
              <th className="px-3 py-2 font-medium">Flight</th>
              <th className="px-3 py-2 font-medium">Airport</th>
              <th className="px-3 py-2 font-medium">Terminal</th>
              <th className="px-3 py-2 font-medium">Travel time</th>
              <th className="px-3 py-2 font-medium">Services</th>
              <th className="px-3 py-2 font-medium">Assigned officer</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-aviation-800">
                  <td colSpan={10} className="px-3 py-2">
                    <div className="h-6 bg-aviation-850 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
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
                    className="border-b border-aviation-800/70 hover:bg-aviation-850 cursor-pointer"
                  >
                    <td
                      className={`px-3 py-2 ${
                        priority === "URGENT"
                          ? "text-rose-400"
                          : priority === "ATTENTION"
                            ? "text-amber-400"
                            : "text-slate-500"
                      }`}
                    >
                      {priority}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-200">{item.booking_reference}</td>
                    <td className="px-3 py-2 text-white">{item.customer_name}</td>
                    <td className="px-3 py-2 font-mono">{item.flight_number || "—"}</td>
                    <td className="px-3 py-2 font-mono">{item.airport_code}</td>
                    <td className="px-3 py-2 text-slate-400">{item.journey_type || "—"}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {formatOperationalDate(item.service_date)} {item.service_time}
                    </td>
                    <td className="px-3 py-2 max-w-[180px] truncate" title={servicesStr}>
                      {servicesStr}
                    </td>
                    <td className="px-3 py-2">{item.assigned_staff_name || "Unassigned"}</td>
                    <td className="px-3 py-2">
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
