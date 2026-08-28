import React from "react";
import type { DashboardMetrics } from "../../types/dashboard";
import { formatCurrencyINR } from "../../lib/dateUtils";

interface SummaryCardsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
  binCount?: number | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, isLoading, binCount }) => {
  const showBin = typeof binCount === "number";
  const cols = showBin ? "lg:grid-cols-6" : "lg:grid-cols-5";

  if (isLoading || !metrics) {
    return (
      <div className={`grid grid-cols-2 ${cols} gap-px overflow-hidden rounded-md border border-aviation-800 bg-aviation-800`}>
        {[1, 2, 3, 4, 5, ...(showBin ? [6] : [])].map((i) => (
          <div key={i} className="bg-aviation-900 p-3 animate-pulse">
            <div className="h-3 w-16 bg-aviation-800 rounded" />
            <div className="mt-2 h-6 w-12 bg-aviation-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Bookings today", value: metrics.todayBookings.toLocaleString() },
    { label: "Pending confirmation", value: metrics.pendingBookings.toLocaleString() },
    { label: "Confirmed", value: metrics.confirmedToday.toLocaleString() },
    { label: "Pending payments", value: metrics.pendingPayments.toLocaleString() },
    { label: "Today's revenue", value: formatCurrencyINR(metrics.dailyRevenueINR) },
    ...(showBin ? [{ label: "In recycle bin", value: binCount.toLocaleString() }] : []),
  ];

  return (
    <div className={`grid grid-cols-2 ${cols} gap-px overflow-hidden rounded-md border border-aviation-800 bg-aviation-800`}>
      {cards.map((card) => (
        <div key={card.label} className="bg-aviation-900 px-4 py-3">
          <div className="text-[11px] text-slate-500">{card.label}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-white">{card.value}</div>
        </div>
      ))}
    </div>
  );
};
