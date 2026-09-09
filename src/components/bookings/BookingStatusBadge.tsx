import React from "react";

interface BookingStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  CONFIRMED: { bg: "bg-lime-50", text: "text-lime-800", dot: "bg-lime-600", border: "border-lime-200" },
  PENDING: { bg: "bg-orange-50", text: "text-orange-800", dot: "bg-orange-500", border: "border-orange-200" },
  ASSIGNED: { bg: "bg-sky-50", text: "text-sky-800", dot: "bg-sky-500", border: "border-sky-200" },
  IN_PROGRESS: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-600", border: "border-emerald-200" },
  COMPLETED: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", border: "border-slate-200" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-rose-200" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  DRAFT: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
};

const DEFAULT_STYLE = { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" };

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = "sm" }) => {
  const normalized = (status || "").toUpperCase().replace(/ /g, "_");
  const style = STATUS_STYLES[normalized] || DEFAULT_STYLE;

  const sizeClasses = size === "md"
    ? "px-2.5 py-1 text-xs"
    : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase border select-none ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {normalized.replace(/_/g, " ")}
    </span>
  );
};
