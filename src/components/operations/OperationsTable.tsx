/**
 * OperationsTable — Phase 20
 * Operational Ground Services Table for Airport Command Desk.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Plane,
  Calendar,
  Users,
  MapPin,
  UserCheck,
  UserX,
  Inbox,
  Clock,
} from "lucide-react";
import type { OperationsQueueItem } from "../../types/operations";
import { OperationsStatusBadge, OperationsPriorityBadge } from "./OperationsStatusBadge";
import { deriveOperationsPriority } from "../../api/operations";
import { formatOperationalDate } from "../../lib/dateUtils";

interface OperationsTableProps {
  items: OperationsQueueItem[];
  isLoading: boolean;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ items, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading operations queue...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <Inbox className="h-10 w-10 text-slate-600" />
        <p className="text-sm text-slate-300 font-medium">No operations match your criteria</p>
        <p className="text-xs text-slate-500 font-mono">
          All airport ground services are either clear or filtered out.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-aviation-800 bg-aviation-850/60 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <th className="py-3 px-4">Attention</th>
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-4">Passenger</th>
              <th className="py-3 px-4">Flight</th>
              <th className="py-3 px-4">Airport</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Service Schedule (IST)</th>
              <th className="py-3 px-4">Workflow Status</th>
              <th className="py-3 px-4">Assigned Officer</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-800/60 text-xs">
            {items.map((item) => {
              const priority = deriveOperationsPriority(item);
              const servicesStr =
                item.selected_services
                  ?.map((s) => (typeof s === "string" ? s : s?.name || s?.service || "Service"))
                  .join(", ") || "Meet & Assist";

              return (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/operations/${encodeURIComponent(item.booking_reference)}`)}
                  className="hover:bg-aviation-800/40 transition-colors cursor-pointer group"
                >
                  {/* Priority / Attention */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <OperationsPriorityBadge priority={priority} />
                  </td>

                  {/* Booking Ref */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-aviation-gold tracking-wide">
                      {item.booking_reference}
                    </div>
                  </td>

                  {/* Passenger */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white group-hover:text-aviation-gold transition-colors">
                      {item.customer_name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{item.customer_phone}</span>
                      <span className="text-slate-600">·</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="h-2.5 w-2.5" />
                        {item.guest_count} pax
                      </span>
                    </div>
                  </td>

                  {/* Flight */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    {item.flight_number ? (
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Plane className="h-3.5 w-3.5 text-sky-400" />
                        <span>{item.flight_number}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Airport & Journey */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-mono font-bold text-white">
                      <MapPin className="h-3 w-3 text-aviation-gold" />
                      <span>{item.airport_code}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                      {item.journey_type}
                    </div>
                  </td>

                  {/* Service Items */}
                  <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-300" title={servicesStr}>
                    {servicesStr}
                  </td>

                  {/* Travel Date / Flight Time in IST */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-200 font-mono">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      <span>{formatOperationalDate(item.service_date)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                      <Clock className="h-2.5 w-2.5 text-slate-500" />
                      <span>{item.service_time} IST</span>
                    </div>
                  </td>

                  {/* Workflow Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <OperationsStatusBadge status={item.status} />
                  </td>

                  {/* Assigned Officer */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.assigned_staff_name ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                        <span>{item.assigned_staff_name}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 font-mono">
                        <UserX className="h-3.5 w-3.5 text-amber-400" />
                        <span>Unassigned</span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-aviation-850 group-hover:bg-aviation-gold group-hover:text-aviation-950 text-slate-300 text-xs font-medium transition-colors">
                      <span>Manage</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
