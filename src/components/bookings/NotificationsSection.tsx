/**
 * NotificationsSection — Phase 21
 * Authoritative Communication & Notification History Console.
 * Fetches real `notification_records` data for the active booking.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Mail,
  FileCheck2,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Radio,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import type { NotificationRecordItem } from "../../types/notification";
import { fetchBookingNotifications, retryBookingConfirmationNotices } from "../../api/notifications";
import { formatOperationalDateTime } from "../../lib/dateUtils";

interface NotificationsSectionProps {
  booking: BookingRecord;
  onRetryNotifications?: () => void;
  isRetrying?: boolean;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  booking,
  onRetryNotifications,
  isRetrying: externalIsRetrying = false,
}) => {
  const bookingRef = booking.bookingRef;
  const isConfirmed = (booking.status || "").toUpperCase() === "CONFIRMED";

  const [records, setRecords] = useState<NotificationRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Local retry state if handled internally
  const [localIsRetrying, setLocalIsRetrying] = useState<boolean>(false);
  const [retryMessage, setRetryMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Expanded error rows
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadHistory = useCallback(
    async (isManual = false) => {
      if (!bookingRef) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const res = await fetchBookingNotifications(bookingRef, controller.signal);

      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setRecords(res.data);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [bookingRef]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle Retry
  const handleRetry = async () => {
    if (onRetryNotifications) {
      onRetryNotifications();
      return;
    }

    if (!bookingRef || localIsRetrying) return;
    setLocalIsRetrying(true);
    setRetryMessage(null);

    const res = await retryBookingConfirmationNotices(bookingRef);

    if (!isMountedRef.current) return;
    setLocalIsRetrying(false);

    if (res.error) {
      setRetryMessage({ text: res.error, isError: true });
    } else {
      setRetryMessage({
        text: res.message || "Confirmation notices re-queued.",
        isError: false,
      });
      // Refresh list after 1.5s to capture newly created records
      setTimeout(() => {
        if (isMountedRef.current) {
          loadHistory(true);
        }
      }, 1500);
    }
  };

  const handleCopyMessageId = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      if (isMountedRef.current) {
        setCopiedId(null);
      }
    }, 2000);
  };

  const isRetrying = externalIsRetrying || localIsRetrying;

  // High-level summary indicator calculations
  const deliveredCount = records.filter((r) => (r.status || "").toUpperCase() === "DELIVERED").length;
  const failedCount = records.filter((r) => (r.status || "").toUpperCase() === "FAILED").length;

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm space-y-0">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
            <MessageSquare className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
              Communications & Delivery Audit
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Authoritative dispatch log from database
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadHistory(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-aviation-850 hover:bg-aviation-800 border border-aviation-800 transition-colors disabled:opacity-50 select-none cursor-pointer"
            title="Refresh communication history"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>

          {isConfirmed && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 border border-sky-500/30 hover:border-sky-600 transition-all disabled:opacity-50 select-none cursor-pointer"
            >
              <Send className={`h-3 w-3 ${isRetrying ? "animate-pulse" : ""}`} />
              <span>{isRetrying ? "Queuing..." : "Retry Notices"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Retry Message Alert */}
        {retryMessage && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
              retryMessage.isError
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            <span>{retryMessage.text}</span>
            <button
              onClick={() => setRetryMessage(null)}
              className="text-slate-400 hover:text-white text-[10px] font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Channel Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp */}
          <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">WhatsApp</span>
                <span className="text-xs text-white font-medium">
                  {records.some((r) => r.channel?.toUpperCase().includes("WHATSAPP") && r.status === "DELIVERED")
                    ? "Delivered"
                    : isConfirmed
                    ? "Active"
                    : "Pending"}
                </span>
              </div>
            </div>
            {deliveredCount > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          </div>

          {/* Email */}
          <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Email Notice</span>
                <span className="text-xs text-white font-medium">
                  {records.some((r) => r.channel?.toUpperCase().includes("EMAIL") && r.status === "DELIVERED")
                    ? "Delivered"
                    : isConfirmed
                    ? "Active"
                    : "Pending"}
                </span>
              </div>
            </div>
            {deliveredCount > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />}
          </div>

          {/* Invoice PDF */}
          <div className="bg-aviation-850/60 p-3 rounded-lg border border-aviation-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Tax Invoice PDF</span>
                <span className="text-xs text-white font-medium">
                  {records.some((r) => r.templateType?.toUpperCase().includes("INVOICE") && r.status === "DELIVERED")
                    ? "Attached / Sent"
                    : isConfirmed
                    ? "Generated"
                    : "Pending"}
                </span>
              </div>
            </div>
            {isConfirmed && <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />}
          </div>
        </div>

        {/* 3. Communication History Table */}
        <div className="space-y-2 pt-2 border-t border-aviation-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              Dispatch History ({records.length})
            </span>
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                <AlertTriangle className="h-3 w-3" />
                {failedCount} Failed Notice{failedCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Loading View */}
          {isLoading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-aviation-850/40 rounded-lg border border-aviation-800">
              <div className="h-5 w-5 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Loading communication history...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-xs flex items-center justify-between text-red-300 font-mono">
              <span>{error}</span>
              <button onClick={() => loadHistory()} className="underline hover:text-white">
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center bg-aviation-850/40 rounded-lg border border-aviation-800 text-xs font-mono text-slate-500 space-y-1">
              <p className="text-slate-400 font-medium">No communication records found for this booking.</p>
              <p className="text-[11px]">Outbound notices will appear here once dispatched.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-aviation-800 bg-aviation-850/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-aviation-800 bg-aviation-850/80 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <th className="py-2.5 px-3">Channel / Type</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Provider ID</th>
                    <th className="py-2.5 px-3">Sent Time (IST)</th>
                    <th className="py-2.5 px-3 text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aviation-800/60 font-mono">
                  {records.map((rec) => {
                    const status = (rec.status || "").toUpperCase();
                    const isFailed = status === "FAILED";
                    const isDelivered = status === "DELIVERED";
                    const isExpanded = expandedRowId === rec.id;

                    const channel = (rec.channel || "").toUpperCase();
                    const isWhatsApp = channel.includes("WHATSAPP");
                    const isEmail = channel.includes("EMAIL");

                    return (
                      <React.Fragment key={rec.id}>
                        <tr className="hover:bg-aviation-800/30 transition-colors">
                          {/* Channel & Template */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {isWhatsApp ? (
                                <MessageSquare className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              ) : isEmail ? (
                                <Mail className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                              ) : (
                                <Radio className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                              )}
                              <span className="font-medium text-white text-[11px]">
                                {formatTemplateName(rec.templateType)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 uppercase">
                              {rec.channel}
                            </div>
                          </td>

                          {/* Recipient */}
                          <td className="py-3 px-3 max-w-[160px] truncate text-slate-300 text-[11px]" title={rec.recipientEmail || rec.recipientPhone || "—"}>
                            {rec.recipientEmail || rec.recipientPhone || (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isDelivered
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : isFailed
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : status === "SENDING"
                                  ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                                  : status === "BYPASSED"
                                  ? "bg-slate-800 text-slate-400 border-slate-700"
                                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {isDelivered && <Check className="h-2.5 w-2.5" />}
                              {isFailed && <XCircle className="h-2.5 w-2.5" />}
                              <span>{status}</span>
                            </span>
                          </td>

                          {/* Provider Message ID */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {rec.messageId ? (
                              <div className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-aviation-800/80 px-2 py-0.5 rounded border border-aviation-700/60 max-w-[140px] truncate">
                                <span className="truncate" title={rec.messageId}>
                                  {rec.messageId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessageId(rec.id, rec.messageId!)}
                                  className="text-slate-400 hover:text-white ml-0.5"
                                  title="Copy Message ID"
                                >
                                  {copiedId === rec.id ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Sent Time in IST */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                            {rec.deliveredAt
                              ? formatOperationalDateTime(rec.deliveredAt)
                              : rec.createdAt
                              ? formatOperationalDateTime(rec.createdAt)
                              : "—"}
                          </td>

                          {/* Attempts */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <span className="text-slate-400 text-[10px]">
                              {rec.attempts || 1}/{rec.maxAttempts || 3}
                            </span>
                            {isFailed && rec.errorLog && (
                              <button
                                onClick={() => setExpandedRowId(isExpanded ? null : rec.id)}
                                className="ml-2 text-red-400 hover:underline text-[10px] inline-flex items-center"
                                title="View error details"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Error Detail Row */}
                        {isExpanded && rec.errorLog && (
                          <tr className="bg-red-500/5 border-b border-red-500/20">
                            <td colSpan={6} className="py-2.5 px-4 text-xs">
                              <div className="flex items-start gap-2 text-red-300 font-mono text-[11px] bg-red-950/30 p-2 rounded border border-red-500/20">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-red-200">Failure Reason:</span>
                                  <p className="break-all">{rec.errorLog}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informative Footer */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-aviation-800/60">
          <div className="flex items-center gap-1.5">
            <span>Customer Phone:</span>
            <span className="text-slate-200">{booking.passengerPhone || "—"}</span>
            <span className="text-slate-600">·</span>
            <span>Email:</span>
            <span className="text-slate-200">{booking.passengerEmail || "—"}</span>
          </div>

          <span className="text-slate-500 text-[10px]">
            Delivery tracking via Resend & Meta Cloud API
          </span>
        </div>
      </div>
    </div>
  );
};

function formatTemplateName(template: string): string {
  if (!template) return "Notification";
  const clean = template.replace(/_/g, " ").toUpperCase();
  switch (clean) {
    case "BOOKING CONFIRMATION":
      return "Confirmation Notice";
    case "WHATSAPP INVOICE PDF":
      return "WhatsApp Tax Invoice";
    case "BOOKING RECEIVED":
      return "Booking Acknowledgement";
    case "ADMIN NEW BOOKING":
      return "Admin Team Alert";
    default:
      return clean;
  }
}
