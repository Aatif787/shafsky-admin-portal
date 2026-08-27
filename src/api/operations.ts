/**
 * Operations Queue API Layer — Phase 20
 * Interfaces with FastAPI `/api/operations` endpoints.
 */

import { apiFetch } from "./client";
import type {
  OperationsQueueItem,
  OperationsDetailResponse,
  OperationsQueueFilters,
  StatusUpdatePayload,
  AssignStaffPayload,
  OperationsPriority,
  OperationsInternalNote,
} from "../types/operations";
import { parseApiError } from "./bookings";

/**
 * Standard duty officers by airport matching backend OperationsEngine roster.
 */
export const DUTY_OFFICERS_BY_AIRPORT: Record<string, Array<{ id: string; name: string; shift: string }>> = {
  DEL: [
    { id: "11111111-1111-1111-1111-111111111111", name: "Officer Vikram Singh", shift: "DAY" },
    { id: "22222222-2222-2222-2222-222222222222", name: "Officer Priya Sharma", shift: "NIGHT" },
  ],
  BOM: [
    { id: "33333333-3333-3333-3333-333333333333", name: "Officer Rajesh Patel", shift: "DAY" },
    { id: "44444444-4444-4444-4444-444444444444", name: "Officer Ananya Roy", shift: "NIGHT" },
  ],
  HYD: [
    { id: "55555555-5555-5555-5555-555555555555", name: "Officer Suresh Reddy", shift: "ALL" },
  ],
  AMD: [
    { id: "66666666-6666-6666-6666-666666666666", name: "Officer Harsh Shah", shift: "ALL" },
  ],
  LKO: [
    { id: "77777777-7777-7777-7777-777777777777", name: "Officer Amit Verma", shift: "ALL" },
  ],
};

/**
 * Derives operational priority for airport ground operations based on documented conditions:
 * - URGENT: Status is NEW with flight today/within 6 hours, OR IN_PROGRESS.
 * - ATTENTION: Unassigned duty officer, OR status in ASSIGNED/READY with service date today.
 * - NORMAL: Assigned duty officer on track or completed.
 */
export function deriveOperationsPriority(item: OperationsQueueItem): OperationsPriority {
  try {
    const status = (item.status || "NEW").toUpperCase();

    if (status === "COMPLETED" || status === "CANCELLED") {
      return "NORMAL";
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = item.service_date === todayStr;

    if (status === "NEW" && isToday) {
      return "URGENT";
    }

    if (status === "IN_PROGRESS") {
      return "URGENT";
    }

    if (!item.assigned_staff_name || !item.assigned_staff_name.trim()) {
      return "ATTENTION";
    }

    if (isToday && (status === "ASSIGNED" || status === "READY" || status === "CUSTOMER_CONTACTED")) {
      return "ATTENTION";
    }

    return "NORMAL";
  } catch {
    return "NORMAL";
  }
}

/**
 * Fetches the active airport operations queue from the FastAPI backend:
 * GET /api/operations/queue?status={status}&airport={airport}
 */
export async function fetchOperationsQueue(
  filters: OperationsQueueFilters = {},
  signal?: AbortSignal
): Promise<{ data: OperationsQueueItem[] | null; total: number; error: string | null }> {
  try {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== "ALL") {
      params.set("status", filters.status.trim().toUpperCase());
    }
    if (filters.airport && filters.airport !== "ALL") {
      params.set("airport", filters.airport.trim().toUpperCase());
    }

    const queryString = params.toString();
    const path = `/api/operations/queue${queryString ? `?${queryString}` : ""}`;

    const res = await apiFetch<any>(path, { signal });

    if (res.error) {
      return { data: null, total: 0, error: res.error };
    }

    const raw = res.data;
    let items: OperationsQueueItem[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : [];

    // Client-side search filtering if search term provided
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.booking_reference.toLowerCase().includes(q) ||
          i.customer_name.toLowerCase().includes(q) ||
          (i.flight_number && i.flight_number.toLowerCase().includes(q)) ||
          i.airport_code.toLowerCase().includes(q) ||
          (i.assigned_staff_name && i.assigned_staff_name.toLowerCase().includes(q))
      );
    }

    // Client-side date filtering if provided
    if (filters.serviceDate && filters.serviceDate.trim()) {
      items = items.filter((i) => i.service_date === filters.serviceDate);
    }

    return {
      data: items,
      total: items.length,
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, total: 0, error: null };
    }
    return {
      data: null,
      total: 0,
      error: err?.message || "Failed to load operations queue.",
    };
  }
}

/**
 * Fetches full details for a single operations queue item:
 * GET /api/operations/queue/{booking_reference}
 */
export async function fetchOperationsDetail(
  bookingReference: string
): Promise<{ data: OperationsDetailResponse | null; error: string | null }> {
  try {
    const res = await apiFetch<any>(`/api/operations/queue/${encodeURIComponent(bookingReference)}`);

    if (res.error) {
      return { data: null, error: res.error };
    }

    const raw = res.data;
    return {
      data: {
        success: Boolean(raw.success),
        item: raw.item,
        timeline: raw.timeline || [],
        internal_notes: raw.internal_notes || [],
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Failed to load operations detail.",
    };
  }
}

/**
 * Transitions workflow status on an operations queue item:
 * POST /api/operations/queue/{booking_reference}/status
 */
export async function updateOperationsStatus(
  bookingReference: string,
  payload: StatusUpdatePayload
): Promise<{ success: boolean; data: OperationsQueueItem | null; error: string | null }> {
  try {
    const res = await apiFetch<OperationsQueueItem>(
      `/api/operations/queue/${encodeURIComponent(bookingReference)}/status`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to update operations status.");
      return {
        success: false,
        data: null,
        error: parsed.message,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred updating status.",
    };
  }
}

/**
 * Assigns a duty officer manually or triggers automatic duty assignment engine:
 * POST /api/operations/queue/{booking_reference}/assign
 */
export async function assignDutyOfficer(
  bookingReference: string,
  payload: AssignStaffPayload = {}
): Promise<{ success: boolean; data: OperationsQueueItem | null; error: string | null }> {
  try {
    const res = await apiFetch<OperationsQueueItem>(
      `/api/operations/queue/${encodeURIComponent(bookingReference)}/assign`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to assign duty officer.");
      return {
        success: false,
        data: null,
        error: parsed.message,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred assigning duty officer.",
    };
  }
}

/**
 * Adds an internal staff-only note:
 * POST /api/operations/queue/{booking_reference}/notes
 */
export async function addOperationsNote(
  bookingReference: string,
  content: string,
  authorId = "STAFF"
): Promise<{ success: boolean; data: OperationsInternalNote | null; error: string | null }> {
  try {
    const res = await apiFetch<OperationsInternalNote>(
      `/api/operations/queue/${encodeURIComponent(bookingReference)}/notes`,
      {
        method: "POST",
        body: JSON.stringify({ content, author_id: authorId }),
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to add operations note.");
      return {
        success: false,
        data: null,
        error: parsed.message,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred adding note.",
    };
  }
}

/**
 * Re-triggers customer notifications (Email & WhatsApp):
 * POST /api/operations/queue/{booking_reference}/notify
 */
export async function triggerOperationsNotifications(
  bookingReference: string
): Promise<{ success: boolean; data: any; error: string | null }> {
  try {
    const res = await apiFetch<any>(
      `/api/operations/queue/${encodeURIComponent(bookingReference)}/notify`,
      {
        method: "POST",
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to dispatch notifications.");
      return {
        success: false,
        data: null,
        error: parsed.message,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred dispatching notifications.",
    };
  }
}
