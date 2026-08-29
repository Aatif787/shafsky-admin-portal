/**
 * Bookings API Layer — Phase 19A
 * Authoritative Server-Side Paginated API, Booking Actions, and Payment Operations.
 */

import { apiFetch } from "./client";
import type { BookingRecord } from "../types/dashboard";
import type {
  BookingListQuery,
  BookingStatusType,
  PaginatedBookings,
  PaginatedDeletionLog,
  DeletionLogRecord,
  PaymentReconcileResponse,
  NotificationRetryResponse,
  MutationResult,
} from "../types/booking";

/**
 * Parses HTTP status codes and backend error messages into clear, actionable operator text.
 */
export function parseApiError(
  status: number | null | undefined,
  backendDetail?: string | null,
  fallbackMessage = "Unable to complete the operation. Please try again."
): { message: string; isConcurrencyConflict: boolean } {
  if (status === 409 || (backendDetail && backendDetail.toLowerCase().includes("version mismatch"))) {
    return {
      message: "This booking was updated by another operator. Refreshing the latest data.",
      isConcurrencyConflict: true,
    };
  }
  if (status === 401) {
    return {
      message: "Your session has expired. Please sign in again.",
      isConcurrencyConflict: false,
    };
  }
  if (status === 403) {
    return {
      message: "You do not have permission to perform this operational action.",
      isConcurrencyConflict: false,
    };
  }
  if (status === 404) {
    return {
      message: backendDetail || "Booking could not be found.",
      isConcurrencyConflict: false,
    };
  }
  if (status === 422) {
    return {
      message: backendDetail || "Invalid request parameters. Please verify input.",
      isConcurrencyConflict: false,
    };
  }
  if (backendDetail && backendDetail.trim()) {
    return {
      message: backendDetail,
      isConcurrencyConflict: false,
    };
  }
  return {
    message: fallbackMessage,
    isConcurrencyConflict: false,
  };
}

/**
 * Fetches server-paginated and filtered bookings from FastAPI backend.
 * Never downloads full dataset; query parameters govern database LIMIT and OFFSET.
 */
export async function fetchAdminBookings(
  query: BookingListQuery = {},
  signal?: AbortSignal
): Promise<{ data: PaginatedBookings | null; error: string | null }> {
  try {
    const params = new URLSearchParams();

    const page = query.page && query.page >= 1 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize >= 1 ? Math.min(query.pageSize, 100) : 25;

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    if (query.status && query.status !== "ALL") {
      params.set("status", query.status);
    }
    if (query.search && query.search.trim()) {
      params.set("search", query.search.trim());
    }
    if (query.serviceCategory && query.serviceCategory !== "ALL") {
      params.set("service_category", query.serviceCategory);
    }
    if (query.dateFrom) {
      params.set("date_from", query.dateFrom);
    }
    if (query.dateTo) {
      params.set("date_to", query.dateTo);
    }

    const queryString = params.toString();
    const path = `/api/bookings/admin/list?${queryString}`;

    const res = await apiFetch<any>(path, { signal });

    if (res.error) {
      return { data: null, error: res.error };
    }

    const raw = res.data;

    if (raw && Array.isArray(raw.items)) {
      return {
        data: {
          items: raw.items as BookingRecord[],
          total: Number(raw.total ?? raw.items.length),
          page: Number(raw.page ?? page),
          pageSize: Number(raw.pageSize ?? raw.page_size ?? pageSize),
          totalPages: Number(raw.totalPages ?? raw.total_pages ?? (Math.ceil((raw.total ?? 0) / pageSize) || 1)),
        },
        error: null,
      };
    }

    // Fallback if returned as direct array (compatibility guard)
    if (Array.isArray(raw)) {
      return {
        data: {
          items: raw as BookingRecord[],
          total: raw.length,
          page: 1,
          pageSize: raw.length || 25,
          totalPages: 1,
        },
        error: null,
      };
    }

    return {
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      },
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, error: null }; // Silent ignore aborted requests
    }
    return {
      data: null,
      error: err?.message || "Failed to load bookings.",
    };
  }
}

/**
 * Fetches a single booking's full details by booking ref or UUID.
 */
export async function fetchBookingDetail(
  identifier: string
): Promise<{ data: BookingRecord | null; error: string | null }> {
  try {
    const res = await apiFetch<BookingRecord>(`/api/bookings/${encodeURIComponent(identifier)}`);

    if (res.error) {
      return { data: null, error: res.error };
    }

    return { data: res.data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Failed to load booking details.",
    };
  }
}

/**
 * Mutates a booking's status using the existing secured backend endpoint:
 * PATCH /api/bookings/admin/{identifier}/status
 * Supports optimistic locking version checking to prevent overwriting concurrent updates.
 */
export async function updateBookingStatus(
  identifier: string,
  newStatus: BookingStatusType,
  version?: number
): Promise<MutationResult<BookingRecord>> {
  try {
    const payload: { status: string; version?: number } = {
      status: newStatus,
    };
    if (typeof version === "number") {
      payload.version = version;
    }

    const res = await apiFetch<BookingRecord>(
      `/api/bookings/admin/${encodeURIComponent(identifier)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to update booking status.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: parsed.isConcurrencyConflict,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred updating status.",
      isConcurrencyConflict: false,
    };
  }
}

/**
 * Cancels a booking using the existing backend endpoint:
 * PATCH /api/bookings/{identifier}/cancel?version={version}
 */
export async function cancelBooking(
  identifier: string,
  version?: number
): Promise<MutationResult<BookingRecord>> {
  try {
    const query = typeof version === "number" ? `?version=${version}` : "";
    const res = await apiFetch<BookingRecord>(
      `/api/bookings/${encodeURIComponent(identifier)}/cancel${query}`,
      {
        method: "PATCH",
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to cancel booking.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: parsed.isConcurrencyConflict,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred during cancellation.",
      isConcurrencyConflict: false,
    };
  }
}

/**
 * Synchronizes and reconciles booking payment with Razorpay gateway:
 * POST /api/payments/admin/reconcile-sync/{bookingRef}
 */
export async function syncBookingPayment(
  bookingRef: string
): Promise<MutationResult<PaymentReconcileResponse>> {
  try {
    const res = await apiFetch<PaymentReconcileResponse>(
      `/api/payments/admin/reconcile-sync/${encodeURIComponent(bookingRef)}`,
      {
        method: "POST",
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Payment reconciliation failed.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: false,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred synchronizing payment.",
      isConcurrencyConflict: false,
    };
  }
}

/**
 * Retries booking confirmation notifications (Email + WhatsApp):
 * POST /api/payments/admin/notifications/retry/{bookingRef}
 */
export async function retryBookingNotifications(
  bookingRef: string
): Promise<MutationResult<NotificationRetryResponse>> {
  try {
    const res = await apiFetch<NotificationRetryResponse>(
      `/api/payments/admin/notifications/retry/${encodeURIComponent(bookingRef)}`,
      {
        method: "POST",
      }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to retry notifications.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: false,
      };
    }

    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred retrying notifications.",
      isConcurrencyConflict: false,
    };
  }
}

export async function recycleBooking(
  identifier: string
): Promise<MutationResult<BookingRecord>> {
  try {
    const res = await apiFetch<BookingRecord>(
      `/api/bookings/admin/${encodeURIComponent(identifier)}/recycle`,
      { method: "POST" }
    );
    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to move booking to the bin.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: parsed.isConcurrencyConflict,
      };
    }
    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "Failed to move booking to the bin.",
      isConcurrencyConflict: false,
    };
  }
}

export async function restoreBooking(
  identifier: string
): Promise<MutationResult<BookingRecord>> {
  try {
    const res = await apiFetch<BookingRecord>(
      `/api/bookings/admin/${encodeURIComponent(identifier)}/restore`,
      { method: "POST" }
    );
    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to restore booking.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: parsed.isConcurrencyConflict,
      };
    }
    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "Failed to restore booking.",
      isConcurrencyConflict: false,
    };
  }
}

export async function purgeBooking(
  identifier: string
): Promise<MutationResult<{ bookingRef?: string }>> {
  try {
    const res = await apiFetch<{ bookingRef?: string }>(
      `/api/bookings/admin/${encodeURIComponent(identifier)}/purge`,
      { method: "DELETE" }
    );
    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to permanently delete booking.");
      return {
        success: false,
        data: null,
        error: parsed.message,
        status: res.status,
        isConcurrencyConflict: false,
      };
    }
    return {
      success: true,
      data: res.data,
      error: null,
      status: res.status,
      isConcurrencyConflict: false,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "Failed to permanently delete booking.",
      isConcurrencyConflict: false,
    };
  }
}

export async function fetchRecycleBin(
  query: { page?: number; pageSize?: number; search?: string } = {},
  signal?: AbortSignal
): Promise<{ data: PaginatedBookings | null; error: string | null }> {
  try {
    const params = new URLSearchParams();
    const page = query.page && query.page >= 1 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize >= 1 ? Math.min(query.pageSize, 100) : 25;
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (query.search && query.search.trim()) {
      params.set("search", query.search.trim());
    }
    const res = await apiFetch<any>(`/api/bookings/admin/bin?${params.toString()}`, { signal });
    if (res.error) {
      return { data: null, error: res.error };
    }
    const raw = res.data;
    if (raw && Array.isArray(raw.items)) {
      return {
        data: {
          items: raw.items as BookingRecord[],
          total: Number(raw.total ?? raw.items.length),
          page: Number(raw.page ?? page),
          pageSize: Number(raw.pageSize ?? pageSize),
          totalPages: Number(
            raw.totalPages ?? Math.max(1, Math.ceil(Number(raw.total ?? raw.items.length) / pageSize))
          ),
        },
        error: null,
      };
    }
    return {
      data: { items: [], total: 0, page: 1, pageSize: 25, totalPages: 1 },
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, error: null };
    }
    return { data: null, error: err?.message || "Failed to load recycle bin." };
  }
}

export async function fetchDeletionLog(
  query: { page?: number; pageSize?: number } = {},
  signal?: AbortSignal
): Promise<{ data: PaginatedDeletionLog | null; error: string | null }> {
  try {
    const params = new URLSearchParams();
    const page = query.page && query.page >= 1 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize >= 1 ? Math.min(query.pageSize, 100) : 25;
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    const res = await apiFetch<any>(`/api/bookings/admin/deletion-log?${params.toString()}`, { signal });
    if (res.error) {
      return { data: null, error: res.error };
    }
    const raw = res.data;
    if (raw && Array.isArray(raw.items)) {
      return {
        data: {
          items: raw.items as DeletionLogRecord[],
          total: Number(raw.total ?? raw.items.length),
          page: Number(raw.page ?? page),
          pageSize: Number(raw.pageSize ?? pageSize),
          totalPages: Number(
            raw.totalPages ?? Math.max(1, Math.ceil(Number(raw.total ?? raw.items.length) / pageSize))
          ),
        },
        error: null,
      };
    }
    return {
      data: { items: [], total: 0, page: 1, pageSize: 25, totalPages: 1 },
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, error: null };
    }
    return { data: null, error: err?.message || "Failed to load deletion log." };
  }
}
