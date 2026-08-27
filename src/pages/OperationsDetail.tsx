/**
 * OperationsDetail Page — Phase 20
 * Airport Ground Services Command & Execution Console (/operations/:bookingRef).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Plane,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Send,
  FileText,
  UserCheck,
  UserPlus,
  Radio,
  History,
  Check,
} from "lucide-react";
import {
  fetchOperationsDetail,
  updateOperationsStatus,
  assignDutyOfficer,
  addOperationsNote,
  triggerOperationsNotifications,
  deriveOperationsPriority,
  DUTY_OFFICERS_BY_AIRPORT,
} from "../api/operations";
import type {
  OperationsQueueItem,
  OperationsTimelineEntry,
  OperationsInternalNote,
  OperationsWorkflowStatus,
} from "../types/operations";
import {
  OperationsStatusBadge,
  OperationsPriorityBadge,
} from "../components/operations/OperationsStatusBadge";
import {
  formatOperationalDateTime,
  formatOperationalDate,
} from "../lib/dateUtils";

const WORKFLOW_STEPS: { value: OperationsWorkflowStatus; label: string }[] = [
  { value: "NEW", label: "NEW — Unassigned Queue" },
  { value: "ASSIGNED", label: "ASSIGNED — Duty Officer Assigned" },
  { value: "IN_PROGRESS", label: "IN PROGRESS — Airside Action" },
  { value: "CUSTOMER_CONTACTED", label: "CUSTOMER CONTACTED — Met / Call Made" },
  { value: "READY", label: "READY — Airside Gate / Arrival" },
  { value: "COMPLETED", label: "COMPLETED — Service Done" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export const OperationsDetail: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<OperationsQueueItem | null>(null);
  const [timeline, setTimeline] = useState<OperationsTimelineEntry[]>([]);
  const [internalNotes, setInternalNotes] = useState<OperationsInternalNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Mutation State
  const [selectedStatus, setSelectedStatus] = useState<OperationsWorkflowStatus>("NEW");
  const [statusReason, setStatusReason] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Duty Assignment State
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [customStaffName, setCustomStaffName] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Note State
  const [noteText, setNoteText] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Notify State
  const [isNotifying, setIsNotifying] = useState<boolean>(false);

  // Feedback Alerts
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ─── Authoritative Load ─── */
  const loadDetail = useCallback(
    async (silent = false) => {
      if (!bookingRef) return;
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      const res = await fetchOperationsDetail(bookingRef);

      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
        if (!silent) setItem(null);
      } else if (res.data) {
        setItem(res.data.item);
        setTimeline(res.data.timeline || []);
        setInternalNotes(res.data.internal_notes || []);
        setSelectedStatus((res.data.item.status as OperationsWorkflowStatus) || "NEW");
        setSelectedStaffId(res.data.item.assigned_staff_id || "");
        setCustomStaffName(res.data.item.assigned_staff_name || "");
      }

      if (!silent) {
        setIsLoading(false);
      }
    },
    [bookingRef]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  /* ─── Clear Alert Banners ─── */
  const clearBanners = () => {
    setFeedbackSuccess(null);
    setFeedbackError(null);
  };

  /* ─── 1. Update Status Handler ─── */
  const handleUpdateStatus = async (targetStatus: OperationsWorkflowStatus) => {
    if (!bookingRef || isUpdatingStatus) return;
    clearBanners();
    setIsUpdatingStatus(true);

    const res = await updateOperationsStatus(bookingRef, {
      status: targetStatus,
      reason: statusReason || undefined,
      actor_id: "ADMIN",
    });

    if (!isMountedRef.current) return;
    setIsUpdatingStatus(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setSelectedStatus(targetStatus);
      setStatusReason("");
      setFeedbackSuccess(`Workflow status moved to ${targetStatus.replace(/_/g, " ")}.`);
      await loadDetail(true);
    }
  };

  /* ─── 2. Assign Officer Handler ─── */
  const handleAssignOfficer = async (isAuto = false) => {
    if (!bookingRef || isAssigning) return;
    clearBanners();
    setIsAssigning(true);

    const payload = isAuto
      ? {}
      : {
          staff_id: selectedStaffId || undefined,
          staff_name: customStaffName || undefined,
          assigned_by: "ADMIN",
        };

    const res = await assignDutyOfficer(bookingRef, payload);

    if (!isMountedRef.current) return;
    setIsAssigning(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setFeedbackSuccess(
        isAuto
          ? `Auto-assigned duty officer: ${res.data?.assigned_staff_name || "Duty Officer"}`
          : `Duty officer assigned: ${customStaffName}`
      );
      await loadDetail(true);
    }
  };

  /* ─── 3. Add Internal Note Handler ─── */
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !noteText.trim() || isAddingNote) return;
    clearBanners();
    setIsAddingNote(true);

    const res = await addOperationsNote(bookingRef, noteText.trim(), "ADMIN_OFFICER");

    if (!isMountedRef.current) return;
    setIsAddingNote(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setNoteText("");
      setFeedbackSuccess("Internal staff note logged.");
      await loadDetail(true);
    }
  };

  /* ─── 4. Re-trigger Notifications Handler ─── */
  const handleTriggerNotifications = async () => {
    if (!bookingRef || isNotifying) return;
    clearBanners();
    setIsNotifying(true);

    const res = await triggerOperationsNotifications(bookingRef);

    if (!isMountedRef.current) return;
    setIsNotifying(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setFeedbackSuccess("Customer operations notifications re-dispatched (Email / WhatsApp).");
      await loadDetail(true);
    }
  };

  /* ─── Loading View ─── */
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <BackButton onClick={() => navigate("/operations")} />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-aviation-gold/30 border-t-aviation-gold rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-mono">
              Loading operations record {bookingRef}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error View ─── */
  if (error || !item) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <BackButton onClick={() => navigate("/operations")} />
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-sm text-red-300 font-medium">Could not load operations item</p>
            <p className="text-xs text-red-400/70 mt-1 font-mono">{error || "Record not found"}</p>
          </div>
          <button
            onClick={() => loadDetail()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const priority = deriveOperationsPriority(item);
  const airportOfficers = DUTY_OFFICERS_BY_AIRPORT[item.airport_code] || [];
  const servicesList = item.selected_services || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 sm:pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/operations")} />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-display font-bold text-white tracking-tight">
                {item.booking_reference}
              </h1>
              <OperationsStatusBadge status={item.status} size="md" />
              <OperationsPriorityBadge priority={priority} size="md" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {item.customer_name} · {item.airport_code} ({item.journey_type}) ·{" "}
              {formatOperationalDate(item.service_date)} at {item.service_time} IST
            </p>
          </div>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleTriggerNotifications}
            disabled={isNotifying}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 border border-sky-500/30 transition-colors disabled:opacity-50 select-none cursor-pointer"
          >
            <Send className={`h-3.5 w-3.5 ${isNotifying ? "animate-pulse" : ""}`} />
            <span>{isNotifying ? "Sending..." : "Dispatch Notices"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadDetail(true)}
            disabled={isUpdatingStatus || isAssigning || isAddingNote}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-aviation-850 hover:bg-aviation-800 hover:text-white border border-aviation-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Operational Feedback Banners */}
      {feedbackSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-300 font-medium">{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {feedbackError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-300 font-medium">{feedbackError}</span>
          </div>
          <button
            onClick={() => setFeedbackError(null)}
            className="text-red-400 hover:text-red-200 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══════════════════════════════════════════
            LEFT COLUMN (7 COLS): Flight & Customer Data + Timeline
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Airport & Flight Schedule */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                <Plane className="h-4 w-4 text-sky-400" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                Airport & Flight Schedule
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-aviation-850/60 border border-aviation-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                    Operating Station
                  </span>
                  <div className="flex items-center gap-2 text-lg font-mono font-bold text-white mt-0.5">
                    <MapPin className="h-4 w-4 text-aviation-gold" />
                    <span>{item.airport_code}</span>
                    <span className="text-xs font-normal text-slate-400">({item.journey_type})</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                    Service Time (IST)
                  </span>
                  <div className="text-sm font-mono font-semibold text-amber-300">
                    {formatOperationalDate(item.service_date)} · {item.service_time} IST
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <Field
                  label="Flight Number"
                  value={
                    item.flight_number ? (
                      <span className="font-mono text-white font-bold">{item.flight_number}</span>
                    ) : (
                      <span className="text-slate-500">Unspecified Flight</span>
                    )
                  }
                />
                <Field
                  label="Guest Count"
                  value={
                    <span className="font-mono text-sky-300 font-bold">
                      {item.guest_count} Passenger{item.guest_count > 1 ? "s" : ""}
                    </span>
                  }
                />
                <Field
                  label="Booking Ref"
                  value={<span className="font-mono text-aviation-gold">{item.booking_reference}</span>}
                />
              </div>
            </div>
          </div>

          {/* 2. Passenger & Contact Info */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                <User className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                Passenger Details
              </h3>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Field label="Passenger Name" value={item.customer_name} />
              <Field
                label="Phone (WhatsApp)"
                value={
                  <a
                    href={`tel:${item.customer_phone}`}
                    className="inline-flex items-center gap-1 text-aviation-gold hover:underline font-mono"
                  >
                    <Phone className="h-3 w-3" />
                    {item.customer_phone}
                  </a>
                }
              />
              <Field
                label="Email"
                value={
                  <a
                    href={`mailto:${item.customer_email}`}
                    className="inline-flex items-center gap-1 text-aviation-gold hover:underline font-mono"
                  >
                    <Mail className="h-3 w-3" />
                    {item.customer_email}
                  </a>
                }
              />
            </div>
          </div>

          {/* 3. Service Inclusions & Special Requests */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                Selected Service Items & Handling
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {servicesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {servicesList.map((srv, idx) => {
                    const label = typeof srv === "string" ? srv : srv?.name || srv?.service || "Service";
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-aviation-850 border border-aviation-700 rounded-lg text-xs text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Standard VIP Meet & Assist ground service package.</p>
              )}

              {item.special_requests && (
                <div className="bg-aviation-850/80 border-l-2 border-aviation-gold rounded-r-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans italic">
                  "{item.special_requests}"
                </div>
              )}
            </div>
          </div>

          {/* 4. Live Audit Timeline */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                  <History className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                  Operations Timeline & Audit Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {timeline.length} Events Logged
              </span>
            </div>

            <div className="p-5">
              {timeline.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-aviation-800">
                  {timeline.map((entry, idx) => (
                    <div key={idx} className="relative pl-7 text-xs">
                      <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-aviation-800 border-2 border-aviation-gold" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="font-semibold text-white">{entry.title || entry.event_type}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatOperationalDateTime(entry.created_at)}
                        </span>
                      </div>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {Object.entries(entry.details).map(([k, v]) => (
                            <span key={k} className="mr-3">
                              {k}: <strong className="text-slate-300">{String(v)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No timeline events recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT COLUMN (5 COLS): Ground Controls, Assignment, Notes
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Workflow Progression Card */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                <Radio className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                Workflow State Progression
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Current Workflow Stage
                </span>
                <OperationsStatusBadge status={item.status} size="md" />
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Transition Workflow State
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OperationsWorkflowStatus)}
                    disabled={isUpdatingStatus}
                    className="flex-1 bg-aviation-850 border border-aviation-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-aviation-gold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {WORKFLOW_STEPS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedStatus)}
                    disabled={isUpdatingStatus || selectedStatus === item.status}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-aviation-950 bg-aviation-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Apply</span>
                  </button>
                </div>
              </div>

              {/* Transition Reason Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Transition Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Passenger arrived at Terminal 3 Gate 4"
                  className="w-full bg-aviation-850 border border-aviation-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aviation-gold transition-colors font-mono"
                />
              </div>

              {/* Quick Progression Buttons */}
              <div className="pt-2 border-t border-aviation-800 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Quick State Buttons
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    disabled={isUpdatingStatus || item.status === "IN_PROGRESS"}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    Start Service
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("CUSTOMER_CONTACTED")}
                    disabled={isUpdatingStatus || item.status === "CUSTOMER_CONTACTED"}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    Contacted Pax
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("READY")}
                    disabled={isUpdatingStatus || item.status === "READY"}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    Ready at Gate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("COMPLETED")}
                    disabled={isUpdatingStatus || item.status === "COMPLETED"}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors disabled:opacity-40"
                  >
                    Complete Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Duty Officer Assignment Panel */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                  <UserCheck className="h-4 w-4 text-sky-400" />
                </div>
                <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                  Duty Officer Assignment
                </h3>
              </div>

              {item.assigned_staff_name && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Assigned
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Active Officer
                </span>
                <span className="text-xs font-semibold text-white">
                  {item.assigned_staff_name || "Unassigned"}
                </span>
              </div>

              {/* Station Roster Dropdown */}
              {airportOfficers.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    {item.airport_code} Station Roster
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedStaffId(id);
                      const found = airportOfficers.find((o) => o.id === id);
                      if (found) setCustomStaffName(found.name);
                    }}
                    className="w-full bg-aviation-850 border border-aviation-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-aviation-gold transition-colors cursor-pointer"
                  >
                    <option value="">-- Select from roster --</option>
                    {airportOfficers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.shift} Shift)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Officer Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Officer Name (Manual / Custom)
                </label>
                <input
                  type="text"
                  value={customStaffName}
                  onChange={(e) => setCustomStaffName(e.target.value)}
                  placeholder="e.g. Officer Vikram Singh"
                  className="w-full bg-aviation-850 border border-aviation-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aviation-gold transition-colors font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAssignOfficer(false)}
                  disabled={isAssigning || !customStaffName.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Assign Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAssignOfficer(true)}
                  disabled={isAssigning}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-aviation-gold hover:text-white bg-aviation-850 hover:bg-aviation-800 border border-aviation-800 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Auto-assign based on airport & shift"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isAssigning ? "animate-spin" : ""}`} />
                  <span>Auto-Assign</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Internal Operations Notes */}
          <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
                  <FileText className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                  Internal Operations Notes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {internalNotes.length} Notes Logged
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Existing Notes List */}
              {internalNotes.length > 0 && (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-aviation-850 p-3 rounded-lg border border-aviation-800 space-y-1 text-xs"
                    >
                      <p className="text-slate-200 font-mono whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>Logged by: {note.author_id || "STAFF"}</span>
                        <span>{formatOperationalDateTime(note.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-1 border-t border-aviation-800">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add airside remarks, gate updates, passenger status..."
                  className="w-full bg-aviation-850 border border-aviation-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aviation-gold transition-colors font-mono leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !noteText.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-aviation-950 bg-aviation-gold hover:bg-amber-400 disabled:opacity-40 transition-all select-none cursor-pointer"
                  >
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Field Helper ─── */
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
      {label}
    </span>
    <span className="text-white font-medium">
      {value || <span className="text-slate-600">—</span>}
    </span>
  </div>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-aviation-850 hover:bg-aviation-800 hover:text-white border border-aviation-800 transition-colors cursor-pointer"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    Operations Queue
  </button>
);
