/**
 * Notification & Communication API Layer — Phase 21
 * Interfaces with FastAPI `/api/notifications` and `/api/payments/admin/notifications` endpoints.
 */

import { apiFetch } from "./client";
import type { NotificationRecordItem } from "../types/notification";
import { parseApiError } from "./bookings";

/**
 * Fetches authoritative communication and delivery history for a booking:
 * GET /api/notifications/admin/booking/{booking_ref}
 */
export async function fetchBookingNotifications(
  bookingRef: string,
  signal?: AbortSignal
): Promise<{ data: NotificationRecordItem[] | null; error: string | null }> {
  try {
    if (!bookingRef || !bookingRef.trim()) {
      return { data: [], error: null };
    }

    const res = await apiFetch<any>(
      `/api/notifications/admin/booking/${encodeURIComponent(bookingRef.trim())}`,
      { signal }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Unable to load communication history.");
      return { data: null, error: parsed.message };
    }

    const raw = res.data;
    let items: NotificationRecordItem[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : [];

    return {
      data: items,
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, error: null };
    }
    return {
      data: null,
      error: err?.message || "Unable to load communication history.",
    };
  }
}

/**
 * Re-dispatches booking confirmation notifications (Email + WhatsApp):
 * POST /api/payments/admin/notifications/retry/{booking_ref}
 */
export async function retryBookingConfirmationNotices(
  bookingRef: string
): Promise<{ success: boolean; message?: string; error: string | null }> {
  try {
    const res = await apiFetch<any>(
      `/api/payments/admin/notifications/retry/${encodeURIComponent(bookingRef)}`,
      { method: "POST" }
    );

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to re-dispatch notifications.");
      return { success: false, error: parsed.message };
    }

    return {
      success: true,
      message: res.data?.data?.message || res.data?.message || "Notifications queued successfully.",
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred re-dispatching notifications.",
    };
  }
}
