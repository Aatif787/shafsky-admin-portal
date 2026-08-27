import React from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import type { DashboardMetrics } from "../../types/dashboard";
import { formatCurrencyINR } from "../../lib/dateUtils";

interface SummaryCardsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-aviation-800 bg-aviation-900/60 p-4 space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-aviation-800 rounded" />
              <div className="h-7 w-7 bg-aviation-800 rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-aviation-800 rounded" />
            <div className="h-2.5 w-24 bg-aviation-850 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Bookings",
      value: metrics.todayBookings.toLocaleString(),
      subtitle: "Created today",
      icon: <CalendarDays className="h-4 w-4 text-cyan-400" />,
      accent: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    },
    {
      title: "Pending Bookings",
      value: metrics.pendingBookings.toLocaleString(),
      subtitle: "Awaiting confirmation",
      icon: <Clock className="h-4 w-4 text-amber-400" />,
      accent: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    },
    {
      title: "Confirmed Bookings",
      value: metrics.confirmedToday.toLocaleString(),
      subtitle: "Active today",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      accent: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    },
    {
      title: "Pending Payments",
      value: metrics.pendingPayments.toLocaleString(),
      subtitle: "Unpaid / in checkout",
      icon: <AlertCircle className="h-4 w-4 text-rose-400" />,
      accent: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    },
    {
      title: "Today's Revenue",
      value: formatCurrencyINR(metrics.dailyRevenueINR),
      subtitle: "Settled revenue (INR)",
      icon: <IndianRupee className="h-4 w-4 text-aviation-gold" />,
      accent: "border-aviation-gold/20 bg-aviation-gold/5 text-aviation-gold col-span-2 sm:col-span-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-xl border border-aviation-800 bg-aviation-900/70 p-4 relative overflow-hidden backdrop-blur-sm transition hover:border-aviation-700 ${
            card.accent ? "" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {card.title}
            </span>
            <div className={`p-1.5 rounded-lg border ${card.accent}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {card.value}
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-slate-400">
              {card.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
