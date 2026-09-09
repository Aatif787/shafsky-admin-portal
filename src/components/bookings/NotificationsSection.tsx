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
    async (silent = false) => {
      if (!bookingRef) return;

      if (!silent) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetchBookingNotifications(bookingRef, controller.signal);
        if (!isMountedRef.current) return;

        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setRecords(res.data);
          setError(null);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load communication history");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [bookingRef]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRetry = async () => {
    if (onRetryNotifications) {
      onRetryNotifications();
      return;
    }

    setLocalIsRetrying(true);
    setRetryMessage(null);

    try {
      const res = await retryBookingConfirmationNotices(bookingRef);
      if (res.error) {
        setRetryMessage({ text: res.error, isError: true });
        setRetryMessage({
          text: res.message || "Confirmation notices successfully queued for retry.",
          isError: false,
        });
        await loadHistory(true);
      }
    } catch (err: any) {
      setRetryMessage({
        text: err.message || "Failed to trigger retry.",
        isError: true,
      });
    } finally {
      if (isMountedRef.current) {
        setLocalIsRetrying(false);
      }
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-200">
            <MessageSquare className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Communications & Delivery Audit
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all disabled:opacity-50 select-none cursor-pointer"
            title="Refresh communication history"
          >
            <RefreshCw className={`h-3 w-3 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>

          {isConfirmed && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-all disabled:opacity-50 select-none cursor-pointer"
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
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              retryMessage.isError
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-lime-50 border-lime-200 text-lime-800"
            }`}
          >
            <span className="font-medium">{retryMessage.text}</span>
            <button
              onClick={() => setRetryMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Channel Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* WhatsApp */}
          <div className="bg-lime-50/40 p-3 rounded-xl border border-lime-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-lime-600" />
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">WhatsApp</span>
                <span className="text-xs text-slate-900 font-semibold">
                  {records.some((r) => r.channel?.toUpperCase().includes("WHATSAPP") && r.status === "DELIVERED")
                    ? "Delivered"
                    : isConfirmed
                    ? "Active"
                    : "Pending"}
                </span>
              </div>
            </div>
            {deliveredCount > 0 && <CheckCircle2 className="h-4 w-4 text-lime-600" />}
          </div>

          {/* Email */}
          <div className="bg-sky-50/40 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-600" />
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Email Notice</span>
                <span className="text-xs text-slate-900 font-semibold">
                  {records.some((r) => r.channel?.toUpperCase().includes("EMAIL") && r.status === "DELIVERED")
                    ? "Delivered"
                    : isConfirmed
                    ? "Active"
                    : "Pending"}
                </span>
              </div>
            </div>
            {deliveredCount > 0 && <CheckCircle2 className="h-4 w-4 text-sky-600" />}
          </div>

          {/* Invoice PDF */}
          <div className="bg-orange-50/40 p-3 rounded-xl border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-orange-600" />
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Tax Invoice PDF</span>
                <span className="text-xs text-slate-900 font-semibold">
                  {records.some((r) => r.templateType?.toUpperCase().includes("INVOICE") && r.status === "DELIVERED")
                    ? "Attached / Sent"
                    : isConfirmed
                    ? "Generated"
                    : "Pending"}
                </span>
              </div>
            </div>
            {isConfirmed && <CheckCircle2 className="h-4 w-4 text-orange-600" />}
          </div>
        </div>

        {/* 3. Communication History Table */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              Dispatch History ({records.length})
            </span>
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <AlertTriangle className="h-3 w-3" />
                {failedCount} Failed Notice{failedCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Loading View */}
          {isLoading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="h-5 w-5 border-2 border-lime-600/30 border-t-lime-600 rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading communication history...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between text-rose-800">
              <span>{error}</span>
              <button onClick={() => loadHistory()} className="underline font-semibold hover:text-rose-950">
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="text-slate-700 font-semibold">No communication records found for this booking.</p>
              <p className="text-[11px]">Outbound notices will appear here once dispatched.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Channel / Type</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Provider ID</th>
                    <th className="py-2.5 px-3">Sent Time (IST)</th>
                    <th className="py-2.5 px-3 text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          {/* Channel & Template */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {isWhatsApp ? (
                                <MessageSquare className="h-3.5 w-3.5 text-lime-600 shrink-0" />
                              ) : isEmail ? (
                                <Mail className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                              ) : (
                                <Radio className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-900 text-[11px]">
                                {formatTemplateName(rec.templateType)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 uppercase">
                              {rec.channel}
                            </div>
                          </td>

                          {/* Recipient */}
                          <td className="py-3 px-3 max-w-[160px] truncate text-slate-700 text-[11px] font-medium" title={rec.recipientEmail || rec.recipientPhone || "—"}>
                            {rec.recipientEmail || rec.recipientPhone || (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isDelivered
                                  ? "bg-lime-50 text-lime-700 border-lime-200"
                                  : isFailed
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : status === "SENDING"
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : status === "BYPASSED"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
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
                              <div className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 max-w-[140px] truncate">
                                <span className="truncate font-mono" title={rec.messageId}>
                                  {rec.messageId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessageId(rec.id, rec.messageId!)}
                                  className="text-slate-400 hover:text-slate-700 ml-0.5"
                                  title="Copy Message ID"
                                >
                                  {copiedId === rec.id ? (
                                    <Check className="h-3 w-3 text-lime-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Sent Time in IST */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                            {rec.deliveredAt
                              ? formatOperationalDateTime(rec.deliveredAt)
                              : rec.createdAt
                              ? formatOperationalDateTime(rec.createdAt)
                              : "—"}
                          </td>

                          {/* Attempts */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <span className="text-slate-500 text-[10px] font-mono">
                              {rec.attempts || 1}/{rec.maxAttempts || 3}
                            </span>
                            {isFailed && rec.errorLog && (
                              <button
                                onClick={() => setExpandedRowId(isExpanded ? null : rec.id)}
                                className="ml-2 text-rose-600 hover:underline text-[10px] inline-flex items-center font-medium"
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
                          <tr className="bg-rose-50/50 border-b border-rose-100">
                            <td colSpan={6} className="py-2.5 px-4 text-xs">
                              <div className="flex items-start gap-2 text-rose-800 text-[11px] bg-white p-3 rounded-lg border border-rose-200 shadow-xs">
                                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-rose-900">Failure Reason:</span>
                                  <p className="break-all font-mono">{rec.errorLog}</p>
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
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span>Customer Phone:</span>
            <span className="text-slate-800 font-mono font-medium">{booking.passengerPhone || "—"}</span>
            <span className="text-slate-300">·</span>
            <span>Email:</span>
            <span className="text-slate-800 font-mono font-medium">{booking.passengerEmail || "—"}</span>
          </div>

          <span className="text-slate-400 text-[10px]">
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
