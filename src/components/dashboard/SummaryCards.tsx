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
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${cols} gap-3`}>
        {[1, 2, 3, 4, 5, ...(showBin ? [6] : [])].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs animate-pulse">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="mt-3 h-7 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Bookings Today",
      value: metrics.todayBookings.toLocaleString(),
      accent: "border-l-4 border-l-lime-500",
      tag: "Total",
      tagColor: "bg-slate-100 text-slate-600",
    },
    {
      label: "Pending Confirmation",
      value: metrics.pendingBookings.toLocaleString(),
      accent: "border-l-4 border-l-orange-500",
      tag: "Action",
      tagColor: "bg-orange-50 text-orange-700 border border-orange-200/60",
    },
    {
      label: "Confirmed",
      value: metrics.confirmedToday.toLocaleString(),
      accent: "border-l-4 border-l-lime-600",
      tag: "Active",
      tagColor: "bg-lime-50 text-lime-700 border border-lime-200/60",
    },
    {
      label: "Pending Payments",
      value: metrics.pendingPayments.toLocaleString(),
      accent: "border-l-4 border-l-orange-400",
      tag: "Unpaid",
      tagColor: "bg-orange-50 text-orange-700 border border-orange-200/60",
    },
    {
      label: "Today's Revenue",
      value: formatCurrencyINR(metrics.dailyRevenueINR),
      accent: "border-l-4 border-l-lime-500",
      tag: "INR",
      tagColor: "bg-lime-50 text-lime-800 border border-lime-200/60 font-mono",
    },
    ...(showBin
      ? [
          {
            label: "In Recycle Bin",
            value: binCount.toLocaleString(),
            accent: "border-l-4 border-l-slate-300",
            tag: "Bin",
            tagColor: "bg-slate-100 text-slate-600",
          },
        ]
      : []),
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${cols} gap-3`}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${card.accent}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">{card.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${card.tagColor}`}>
              {card.tag}
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};
