/**
 * BookingStatusBadge — Phase 18
 * Reusable status indicator with aviation-themed color coding.
 */

import React from "react";

interface BookingStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  CONFIRMED: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  PENDING: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
  ASSIGNED: { bg: "bg-sky-500/15", text: "text-sky-400", dot: "bg-sky-400" },
  IN_PROGRESS: { bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-400" },
  COMPLETED: { bg: "bg-slate-500/15", text: "text-slate-300", dot: "bg-slate-400" },
  CANCELLED: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
  REJECTED: { bg: "bg-rose-500/15", text: "text-rose-400", dot: "bg-rose-400" },
  DRAFT: { bg: "bg-zinc-500/15", text: "text-zinc-400", dot: "bg-zinc-400" },
};

const DEFAULT_STYLE = { bg: "bg-slate-500/15", text: "text-slate-400", dot: "bg-slate-400" };

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = "sm" }) => {
  const normalized = (status || "").toUpperCase().replace(/ /g, "_");
  const style = STATUS_STYLES[normalized] || DEFAULT_STYLE;

  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-xs"
    : "px-2 py-1 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide uppercase ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {normalized.replace(/_/g, " ")}
    </span>
  );
};
