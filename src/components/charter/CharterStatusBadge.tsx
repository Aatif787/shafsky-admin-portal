/**
 * CharterStatusBadge — Phase 19B
 * Premium Aviation Status & Priority Badges for Private Charter Desk.
 */

import React from "react";
import {
  Sparkles,
  PhoneCall,
  Search,
  FileCheck,
  Send,
  UserCheck,
  CheckCircle2,
  XCircle,
  Archive,
  AlertTriangle,
  Flame,
  Clock,
  Check,
} from "lucide-react";
import type { CharterRequestStatus, CharterPriority } from "../../types/charter";

interface StatusBadgeProps {
  status: CharterRequestStatus | string;
  size?: "sm" | "md";
}

export const CharterStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const norm = (status || "REQUESTED").toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case "REQUESTED":
        return {
          bg: "bg-orange-50 text-orange-800 border-orange-200",
          icon: <Sparkles className="h-3 w-3 text-orange-600" />,
          label: "NEW REQUEST",
        };
      case "CONTACTED":
        return {
          bg: "bg-sky-50 text-sky-800 border-sky-200",
          icon: <PhoneCall className="h-3 w-3 text-sky-600" />,
          label: "CONTACTED",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          icon: <Search className="h-3 w-3 text-indigo-600" />,
          label: "UNDER REVIEW",
        };
      case "AIRCRAFT_SEARCH":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Search className="h-3 w-3 text-blue-600" />,
          label: "AIRCRAFT SEARCH",
        };
      case "OPTIONS_PREPARED":
        return {
          bg: "bg-violet-50 text-violet-800 border-violet-200",
          icon: <FileCheck className="h-3 w-3 text-violet-600" />,
          label: "OPTIONS READY",
        };
      case "QUOTE_PREPARED":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: <FileCheck className="h-3 w-3 text-purple-600" />,
          label: "QUOTE PREPARED",
        };
      case "QUOTE_SENT":
        return {
          bg: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
          icon: <Send className="h-3 w-3 text-fuchsia-600" />,
          label: "QUOTE SENT",
        };
      case "CUSTOMER_REVIEW":
        return {
          bg: "bg-teal-50 text-teal-800 border-teal-200",
          icon: <UserCheck className="h-3 w-3 text-teal-600" />,
          label: "CUSTOMER REVIEW",
        };
      case "CONFIRMED":
        return {
          bg: "bg-lime-50 text-lime-800 border-lime-200",
          icon: <CheckCircle2 className="h-3 w-3 text-lime-600" />,
          label: "CONFIRMED",
        };
      case "CLOSED":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <Archive className="h-3 w-3 text-slate-500" />,
          label: "CLOSED",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <XCircle className="h-3 w-3 text-rose-600" />,
          label: "CANCELLED",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: <Check className="h-3 w-3 text-slate-600" />,
          label: norm,
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs gap-1.5" : "px-2 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium border select-none ${style.bg} ${sizeClasses}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: CharterPriority;
  size?: "sm" | "md";
}

export const CharterPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "sm" }) => {
  const getStyle = () => {
    switch (priority) {
      case "URGENT":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <Flame className="h-3 w-3 text-rose-600" />,
          label: "URGENT",
        };
      case "HIGH":
        return {
          bg: "bg-orange-50 text-orange-800 border-orange-200",
          icon: <AlertTriangle className="h-3 w-3 text-orange-600" />,
          label: "HIGH",
        };
      case "MEDIUM":
        return {
          bg: "bg-sky-50 text-sky-800 border-sky-200",
          icon: <Clock className="h-3 w-3 text-sky-600" />,
          label: "MEDIUM",
        };
      case "STANDARD":
      default:
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: null,
          label: "STANDARD",
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs gap-1.5" : "px-2 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-semibold border select-none ${style.bg} ${sizeClasses}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};
