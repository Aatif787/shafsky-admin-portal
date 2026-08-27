/**
 * CharterTable — Phase 19B
 * Premium Aviation Operational Table for Private Charter Inquiries.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Plane,
  Calendar,
  Users,
  ChevronLeft,
  Inbox,
  Building2,
  Phone,
} from "lucide-react";
import type { CharterRequestRecord } from "../../types/charter";
import { CharterStatusBadge, CharterPriorityBadge } from "./CharterStatusBadge";
import { computeCharterPriority } from "../../api/charter";
import { formatOperationalDate, formatOperationalDateTime } from "../../lib/dateUtils";

interface CharterTableProps {
  items: CharterRequestRecord[];
  isLoading: boolean;
  total: number;
  skip: number;
  limit: number;
  onPageChange: (newSkip: number) => void;
}

export const CharterTable: React.FC<CharterTableProps> = ({
  items,
  isLoading,
  total,
  skip,
  limit,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  if (isLoading) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading charter enquiries...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <Inbox className="h-10 w-10 text-slate-600" />
        <p className="text-sm text-slate-300 font-medium">No charter enquiries match your criteria</p>
        <p className="text-xs text-slate-500 font-mono">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-aviation-800 bg-aviation-850/60 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Ref & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Aircraft</th>
              <th className="py-3 px-4">Pax</th>
              <th className="py-3 px-4">Departure</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-800/60 text-xs">
            {items.map((record) => {
              const priority = computeCharterPriority(record);
              const paxCount = record.passengers?.total ?? record.passengers?.adults ?? 1;

              return (
                <tr
                  key={record.id}
                  onClick={() => navigate(`/charter/${record.id}`)}
                  className="hover:bg-aviation-800/40 transition-colors cursor-pointer group"
                >
                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <CharterPriorityBadge priority={priority} />
                  </td>

                  {/* Reference & Created */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-aviation-gold tracking-wide">
                      {record.request_reference}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {formatOperationalDateTime(record.created_at)}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white group-hover:text-aviation-gold transition-colors">
                      {record.customer_name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      {record.company && (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          {record.company}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <Phone className="h-2.5 w-2.5 text-slate-500" />
                        {record.phone}
                      </span>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-white">
                      <span>{record.origin}</span>
                      <span className="text-aviation-gold">→</span>
                      <span>{record.destination}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                      {record.trip_type.replace(/_/g, " ")}
                    </div>
                  </td>

                  {/* Aircraft */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Plane className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                      <span className="capitalize">{record.aircraft_preference.replace(/_/g, " ").toLowerCase()}</span>
                    </div>
                  </td>

                  {/* Passengers */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-300 font-mono">
                      <Users className="h-3 w-3 text-sky-400" />
                      <span>{paxCount} pax</span>
                    </div>
                  </td>

                  {/* Requested Departure */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-200 font-mono">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      <span>{formatOperationalDate(record.departure_date)}</span>
                    </div>
                    {record.departure_time && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {record.departure_time}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <CharterStatusBadge status={record.status} />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-aviation-800 group-hover:bg-aviation-gold group-hover:text-aviation-950 text-slate-300 text-xs font-medium transition-colors">
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-aviation-800 bg-aviation-850/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 font-mono text-[11px]">
          Showing <strong className="text-white">{skip + 1}</strong> to{" "}
          <strong className="text-white">{Math.min(skip + limit, total)}</strong> of{" "}
          <strong className="text-white">{total}</strong> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(Math.max(0, skip - limit));
            }}
            disabled={skip === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-aviation-800 bg-aviation-850 text-slate-300 hover:text-white hover:bg-aviation-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-slate-400 font-mono text-xs px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(skip + limit);
            }}
            disabled={skip + limit >= total}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-aviation-800 bg-aviation-850 text-slate-300 hover:text-white hover:bg-aviation-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
