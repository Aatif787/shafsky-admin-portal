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
          bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          icon: <Sparkles className="h-3 w-3 text-amber-400" />,
          label: "NEW REQUEST",
        };
      case "CONTACTED":
        return {
          bg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
          icon: <PhoneCall className="h-3 w-3 text-sky-400" />,
          label: "CONTACTED",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
          icon: <Search className="h-3 w-3 text-indigo-400" />,
          label: "UNDER REVIEW",
        };
      case "AIRCRAFT_SEARCH":
        return {
          bg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
          icon: <Search className="h-3 w-3 text-blue-400" />,
          label: "AIRCRAFT SEARCH",
        };
      case "OPTIONS_PREPARED":
        return {
          bg: "bg-violet-500/10 text-violet-300 border-violet-500/30",
          icon: <FileCheck className="h-3 w-3 text-violet-400" />,
          label: "OPTIONS READY",
        };
      case "QUOTE_PREPARED":
        return {
          bg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
          icon: <FileCheck className="h-3 w-3 text-purple-400" />,
          label: "QUOTE PREPARED",
        };
      case "QUOTE_SENT":
        return {
          bg: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
          icon: <Send className="h-3 w-3 text-fuchsia-400" />,
          label: "QUOTE SENT",
        };
      case "CUSTOMER_REVIEW":
        return {
          bg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
          icon: <UserCheck className="h-3 w-3 text-teal-400" />,
          label: "CUSTOMER REVIEW",
        };
      case "CONFIRMED":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
          label: "CONFIRMED",
        };
      case "CLOSED":
        return {
          bg: "bg-slate-800 text-slate-400 border-slate-700",
          icon: <Archive className="h-3 w-3 text-slate-500" />,
          label: "CLOSED",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: <XCircle className="h-3 w-3 text-red-400" />,
          label: "CANCELLED",
        };
      default:
        return {
          bg: "bg-slate-800 text-slate-300 border-slate-700",
          icon: <Check className="h-3 w-3" />,
          label: norm,
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs gap-1.5" : "px-2 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium border ${style.bg} ${sizeClasses}`}
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
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: <Flame className="h-3 w-3 text-red-400 animate-pulse" />,
          label: "URGENT",
        };
      case "HIGH":
        return {
          bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle className="h-3 w-3 text-amber-400" />,
          label: "HIGH",
        };
      case "MEDIUM":
        return {
          bg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
          icon: <Clock className="h-3 w-3 text-sky-400" />,
          label: "MEDIUM",
        };
      case "STANDARD":
      default:
        return {
          bg: "bg-slate-800 text-slate-400 border-slate-700",
          icon: null,
          label: "STANDARD",
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === "md" ? "px-2.5 py-1 text-xs gap-1.5" : "px-2 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-semibold border ${style.bg} ${sizeClasses}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
};
