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
          bg: "bg-orange-50 text-orange-800 border-orange-200",
          icon: <Sparkles className="h-3 w-3 text-orange-600" />,
          label: "NEW",
        };
      case "ASSIGNED":
        return {
          bg: "bg-sky-50 text-sky-800 border-sky-200",
          icon: <UserCheck className="h-3 w-3 text-sky-600" />,
          label: "ASSIGNED",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-lime-50 text-lime-800 border-lime-200",
          icon: <Play className="h-3 w-3 text-lime-600" />,
          label: "IN PROGRESS",
        };
      case "CUSTOMER_CONTACTED":
        return {
          bg: "bg-teal-50 text-teal-800 border-teal-200",
          icon: <PhoneCall className="h-3 w-3 text-teal-600" />,
          label: "CONTACTED",
        };
      case "READY":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <CheckCircle2 className="h-3 w-3 text-blue-600" />,
          label: "READY",
        };
      case "COMPLETED":
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: <Check className="h-3 w-3 text-slate-600" />,
          label: "COMPLETED",
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
  priority: OperationsPriority;
  size?: "sm" | "md";
}

export const OperationsPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "sm" }) => {
  const getStyle = () => {
    switch (priority) {
      case "URGENT":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <Flame className="h-3 w-3 text-rose-600" />,
          label: "URGENT",
        };
      case "ATTENTION":
        return {
          bg: "bg-orange-50 text-orange-800 border-orange-200",
          icon: <AlertTriangle className="h-3 w-3 text-orange-600" />,
          label: "ATTENTION",
        };
      case "NORMAL":
      default:
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: null,
          label: "NORMAL",
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
