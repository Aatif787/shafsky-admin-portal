/**
 * CharterDetail Page — Phase 19B
 * Premium Aviation Private Charter Triage & Management Console (/charter/:id).
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
  Building2,
  ShieldCheck,
  CheckCircle2,
  Save,
  FileText,
  Sparkles,
  Tag,
  Check,
} from "lucide-react";
import { fetchAdminCharterDetail, updateAdminCharterRequest, computeCharterPriority } from "../api/charter";
import type { CharterRequestRecord, CharterRequestStatus } from "../types/charter";
import { CharterStatusBadge, CharterPriorityBadge } from "../components/charter/CharterStatusBadge";
import {
  formatOperationalDateTime,
  formatOperationalDate,
} from "../lib/dateUtils";

const ALL_STATUSES: { value: CharterRequestStatus; label: string }[] = [
  { value: "REQUESTED", label: "New Request" },
  { value: "CONTACTED", label: "Contacted Customer" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "AIRCRAFT_SEARCH", label: "Searching Aircraft Fleet" },
  { value: "OPTIONS_PREPARED", label: "Options Ready" },
  { value: "QUOTE_PREPARED", label: "Quote Prepared" },
  { value: "QUOTE_SENT", label: "Quote Dispatched" },
  { value: "CUSTOMER_REVIEW", label: "Customer Reviewing Quote" },
  { value: "CONFIRMED", label: "Charter Confirmed" },
  { value: "CLOSED", label: "Inquiry Closed / Completed" },
  { value: "CANCELLED", label: "Inquiry Cancelled" },
];

export const CharterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [charter, setCharter] = useState<CharterRequestRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Operational Mutation States
  const [selectedStatus, setSelectedStatus] = useState<CharterRequestStatus>("REQUESTED");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [assignedStaff, setAssignedStaff] = useState<string>("");

  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
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
      if (!id) return;
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      const res = await fetchAdminCharterDetail(id);

      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
        if (!silent) setCharter(null);
      } else if (res.data) {
        setCharter(res.data);
        setSelectedStatus(res.data.status);
        setInternalNotes(res.data.internal_notes || "");
        setAssignedStaff(res.data.assigned_staff_name || "");
      }

      if (!silent) {
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  /* ─── Clear Banner Alerts ─── */
  const clearBanners = () => {
    setFeedbackSuccess(null);
    setFeedbackError(null);
  };

  /* ─── Status Update Handler ─── */
  const handleUpdateStatus = async (newStatus: CharterRequestStatus) => {
    if (!id || isSavingStatus) return;
    clearBanners();
    setIsSavingStatus(true);

    const res = await updateAdminCharterRequest(id, { status: newStatus });

    if (!isMountedRef.current) return;
    setIsSavingStatus(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setSelectedStatus(newStatus);
      setFeedbackSuccess(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      await loadDetail(true);
    }
  };

  /* ─── Save Notes Handler ─── */
  const handleSaveNotes = async () => {
    if (!id || isSavingNotes) return;
    clearBanners();
    setIsSavingNotes(true);

    const res = await updateAdminCharterRequest(id, {
      internal_notes: internalNotes,
      assigned_staff_name: assignedStaff || undefined,
    });

    if (!isMountedRef.current) return;
    setIsSavingNotes(false);

    if (res.error) {
      setFeedbackError(res.error);
    } else {
      setFeedbackSuccess("Internal notes & staff assignment saved successfully.");
      await loadDetail(true);
    }
  };

  /* ─── Loading View ─── */
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <BackButton onClick={() => navigate("/charter")} />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-lime-600/30 border-t-lime-600 rounded-full animate-spin" />
            <span className="text-sm text-slate-500 font-mono">
              Loading charter inquiry details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error View ─── */
  if (error || !charter) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <BackButton onClick={() => navigate("/charter")} />
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-rose-900">Charter enquiry could not be loaded.</p>
            <p className="text-xs text-rose-700 mt-1">{error || "Record not found"}</p>
          </div>
          <button
            onClick={() => loadDetail()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const priority = computeCharterPriority(charter);
  const paxTotal = charter.passengers?.total ?? charter.passengers?.adults ?? 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 sm:pb-10">
      {/* Top Navigation & Ref Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/charter")} />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                {charter.request_reference}
              </h1>
              <CharterStatusBadge status={charter.status} size="md" />
              <CharterPriorityBadge priority={priority} size="md" />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {charter.customer_name}
              {charter.company ? ` · ${charter.company}` : ""}
              {" · "}
              {charter.origin} → {charter.destination}
            </p>
          </div>
        </div>

        {/* Reload */}
        <button
          type="button"
          onClick={() => loadDetail(true)}
          disabled={isSavingStatus || isSavingNotes}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Operational Feedback Alert Banners */}
      {feedbackSuccess && (
        <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-lime-600 flex-shrink-0" />
            <span className="text-xs text-lime-800 font-medium">{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-lime-700 hover:text-lime-900 text-xs font-mono font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {feedbackError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span className="text-xs text-rose-800 font-medium">{feedbackError}</span>
          </div>
          <button
            onClick={() => setFeedbackError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-mono font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══════════════════════════════════════════
            LEFT COLUMN (7 COLS): Customer & Journey Data (Read-Only)
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-100">
                <User className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-800">
                Customer & Contact Details
              </h3>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Field label="Full Name" value={charter.customer_name} />
              <Field
                label="Company / Organization"
                value={
                  charter.company ? (
                    <span className="inline-flex items-center gap-1 text-slate-900 font-medium">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      {charter.company}
                    </span>
                  ) : null
                }
              />
              <Field
                label="Phone (WhatsApp)"
                value={
                  <a
                    href={`tel:${charter.country_code}${charter.phone}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline font-mono font-medium"
                  >
                    <Phone className="h-3 w-3" />
                    {charter.country_code} {charter.phone}
                  </a>
                }
              />
              <Field
                label="Email"
                value={
                  <a
                    href={`mailto:${charter.email}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline font-mono font-medium"
                  >
                    <Mail className="h-3 w-3" />
                    {charter.email}
                  </a>
                }
              />
              <Field
                label="Preferred Contact"
                value={charter.preferred_contact_method.replace(/_/g, " ")}
              />
              <Field
                label="Submission Time"
                value={formatOperationalDateTime(charter.created_at)}
              />
            </div>
          </div>

          {/* 2. Flight & Journey Requirement */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-100">
                <Plane className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-800">
                Flight & Route Requirement
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Route banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Route ({charter.trip_type.replace(/_/g, " ")})
                  </span>
                  <div className="flex items-center gap-2 text-lg font-mono font-bold text-slate-900 mt-0.5">
                    <span>{charter.origin}</span>
                    <span className="text-orange-500">→</span>
                    <span>{charter.destination}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                      Departure Date
                    </span>
                    <span className="text-sm font-mono font-semibold text-orange-600">
                      {formatOperationalDate(charter.departure_date)}
                    </span>
                    {charter.departure_time && (
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {charter.departure_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Aircraft & Passenger Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
                <Field
                  label="Aircraft Preference"
                  value={
                    <span className="capitalize font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                      {charter.aircraft_preference.replace(/_/g, " ").toLowerCase()}
                    </span>
                  }
                />
                <Field
                  label="Total Passengers"
                  value={
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {paxTotal} Passengers
                    </span>
                  }
                />
                <Field
                  label="Pax Breakdown"
                  value={
                    <span className="font-mono text-slate-700">
                      {charter.passengers?.adults || 1} Adults
                      {charter.passengers?.children ? ` · ${charter.passengers.children} Children` : ""}
                      {charter.passengers?.infants ? ` · ${charter.passengers.infants} Infants` : ""}
                    </span>
                  }
                />
                {charter.return_date && (
                  <Field
                    label="Return Schedule"
                    value={
                      <span className="font-mono text-slate-900">
                        {formatOperationalDate(charter.return_date)}
                        {charter.return_time ? ` (${charter.return_time})` : ""}
                      </span>
                    }
                  />
                )}
              </div>

              {/* Detailed Itinerary Legs if multiple */}
              {charter.itinerary && charter.itinerary.length > 1 && (
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Full Flight Itinerary ({charter.itinerary.length} Legs)
                  </span>
                  <div className="space-y-2">
                    {charter.itinerary.map((leg, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">Leg {idx + 1}:</span>
                          <span className="text-slate-900 font-semibold">
                            {leg.origin} → {leg.destination}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          {formatOperationalDate(leg.departure_date)}
                          {leg.departure_time ? ` (${leg.departure_time})` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Travel Requirements & Special Requests (Quote Card) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100">
                <Sparkles className="h-4 w-4 text-orange-500" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-800">
                Customer Travel Requirements & Special Requests
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Requirements Chips */}
              {charter.travel_requirements && charter.travel_requirements.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                    Selected Travel Services
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {charter.travel_requirements.map((req, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md text-xs text-orange-800 font-medium"
                      >
                        <Tag className="h-3 w-3 text-orange-600" />
                        <span>{req}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests Quote Box */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                  Customer Notes & Itinerary Remarks
                </span>
                {charter.special_requests ? (
                  <div className="relative bg-orange-50/40 border-l-4 border-orange-500 rounded-r-xl p-4 text-xs text-slate-800 leading-relaxed font-sans italic whitespace-pre-wrap">
                    "{charter.special_requests}"
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom notes specified by customer.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT COLUMN (5 COLS): Operational Controls & Notes (Editable)
            ═══════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Status Workflow Progression Panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-50 border border-lime-100">
                <ShieldCheck className="h-4 w-4 text-lime-600" />
              </div>
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-800">
                Lifecycle & Status Progression
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Current Status
                </span>
                <CharterStatusBadge status={charter.status} size="md" />
              </div>

              {/* Status Select Control */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Update Workflow Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as CharterRequestStatus)}
                    disabled={isSavingStatus}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label} ({st.value})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedStatus)}
                    disabled={isSavingStatus || selectedStatus === charter.status}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-lime-600 hover:bg-lime-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none cursor-pointer shadow-xs"
                  >
                    {isSavingStatus ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Apply</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Quick Actions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("CONTACTED")}
                    disabled={isSavingStatus || charter.status === "CONTACTED"}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("QUOTE_SENT")}
                    disabled={isSavingStatus || charter.status === "QUOTE_SENT"}
                    className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Mark Quote Sent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={isSavingStatus || charter.status === "CONFIRMED"}
                    className="px-2.5 py-1.5 rounded-lg bg-lime-50 hover:bg-lime-100 text-lime-700 border border-lime-200 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Confirm Charter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("CLOSED")}
                    disabled={isSavingStatus || charter.status === "CLOSED"}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Close Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Internal Notes & Operator Assignment Panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100">
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-800">
                  Internal Operations Notes
                </h3>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                Updated: {formatOperationalDateTime(charter.updated_at)}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Staff Assignment */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Assigned Duty Officer
                </label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="e.g. Duty Officer / Charter Desk Lead"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors"
                />
              </div>

              {/* Running Notes Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Running Internal Notes
                </label>
                <textarea
                  rows={6}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add operator logs, aircraft availability checks, pricing notes, quote numbers, customer communication logs..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors font-mono leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50 select-none cursor-pointer shadow-xs"
                >
                  <Save className={`h-3.5 w-3.5 ${isSavingNotes ? "animate-spin" : ""}`} />
                  <span>{isSavingNotes ? "Saving..." : "Save Notes & Assignment"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Helper Components ─── */
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
      {label}
    </span>
    <span className="text-slate-900 font-medium">
      {value || <span className="text-slate-300">—</span>}
    </span>
  </div>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    Charter Desk
  </button>
);
