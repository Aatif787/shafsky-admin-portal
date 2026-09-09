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
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading charter enquiries...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
        <Inbox className="h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-800 font-semibold">No charter enquiries match your criteria</p>
        <p className="text-xs text-slate-500">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Ref & Date</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Route</th>
              <th className="py-3 px-4 font-semibold">Aircraft</th>
              <th className="py-3 px-4 font-semibold">Pax</th>
              <th className="py-3 px-4 font-semibold">Departure</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((record) => {
              const priority = computeCharterPriority(record);
              const paxCount = record.passengers?.total ?? record.passengers?.adults ?? 1;

              return (
                <tr
                  key={record.id}
                  onClick={() => navigate(`/charter/${record.id}`)}
                  className="hover:bg-orange-50/20 transition-colors cursor-pointer group"
                >
                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <CharterPriorityBadge priority={priority} />
                  </td>

                  {/* Reference & Created */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-orange-600 tracking-wide group-hover:text-orange-700">
                      {record.request_reference}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {formatOperationalDateTime(record.created_at)}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {record.customer_name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      {record.company && (
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {record.company}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-slate-500 font-mono">
                        <Phone className="h-2.5 w-2.5 text-slate-400" />
                        {record.phone}
                      </span>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                      <span>{record.origin}</span>
                      <span className="text-orange-500 font-bold">→</span>
                      <span>{record.destination}</span>
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                      {record.trip_type.replace(/_/g, " ")}
                    </div>
                  </td>

                  {/* Aircraft */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Plane className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                      <span className="capitalize">{record.aircraft_preference.replace(/_/g, " ").toLowerCase()}</span>
                    </div>
                  </td>

                  {/* Passengers */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Users className="h-3 w-3 text-sky-600" />
                      <span>{paxCount} pax</span>
                    </div>
                  </td>

                  {/* Requested Departure */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-800 font-medium">
                      <Calendar className="h-3 w-3 text-orange-500" />
                      <span>{formatOperationalDate(record.departure_date)}</span>
                    </div>
                    {record.departure_time && (
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-orange-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-all">
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
      <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-medium text-[11px]">
          Showing <strong className="text-slate-900 font-semibold">{skip + 1}</strong> to{" "}
          <strong className="text-slate-900 font-semibold">{Math.min(skip + limit, total)}</strong> of{" "}
          <strong className="text-slate-900 font-semibold">{total}</strong> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(Math.max(0, skip - limit));
            }}
            disabled={skip === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold shadow-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-slate-500 font-medium text-xs px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPageChange(skip + limit);
            }}
            disabled={skip + limit >= total}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold shadow-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
