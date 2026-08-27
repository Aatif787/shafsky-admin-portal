/**
 * OperationsStatusBadge — Phase 20
 * Airport Operations Workflow & Priority Badges.
 */

import React from "react";
import {
  Sparkles,
  UserCheck,
  Play,
  PhoneCall,
  CheckCircle2,
  Check,
  XCircle,
  Flame,
  AlertTriangle,
} from "lucide-react";
import type { OperationsWorkflowStatus, OperationsPriority } from "../../types/operations";

interface StatusBadgeProps {
  status: OperationsWorkflowStatus | string;
  size?: "sm" | "md";
}

export const OperationsStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const norm = (status || "NEW").toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case "NEW":
        return {
          bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          icon: <Sparkles className="h-3 w-3 text-amber-400" />,
          label: "NEW",
        };
      case "ASSIGNED":
        return {
          bg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
          icon: <UserCheck className="h-3 w-3 text-sky-400" />,
          label: "ASSIGNED",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
          icon: <Play className="h-3 w-3 text-indigo-400" />,
          label: "IN PROGRESS",
        };
      case "CUSTOMER_CONTACTED":
        return {
          bg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
          icon: <PhoneCall className="h-3 w-3 text-teal-400" />,
          label: "CONTACTED",
        };
      case "READY":
        return {
          bg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
          icon: <CheckCircle2 className="h-3 w-3 text-blue-400" />,
          label: "READY",
        };
      case "COMPLETED":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <Check className="h-3 w-3 text-emerald-400" />,
          label: "COMPLETED",
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
  priority: OperationsPriority;
  size?: "sm" | "md";
}

export const OperationsPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "sm" }) => {
  const getStyle = () => {
    switch (priority) {
      case "URGENT":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: <Flame className="h-3 w-3 text-red-400 animate-pulse" />,
          label: "URGENT",
        };
      case "ATTENTION":
        return {
          bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle className="h-3 w-3 text-amber-400" />,
          label: "ATTENTION",
        };
      case "NORMAL":
      default:
        return {
          bg: "bg-slate-800 text-slate-400 border-slate-700",
          icon: null,
          label: "NORMAL",
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
