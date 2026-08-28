/**
 * Booking Types for Admin Portal — Phase 19A
 * Server-Side Pagination, Status Mutations, and Payment Operations.
 */

import type { BookingRecord } from "./dashboard";

export type { BookingRecord } from "./dashboard";

/** All possible booking statuses from the backend BookingStatus enum. */
export type BookingStatusType =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

/** Filter & pagination query state for the bookings list API. */
export interface BookingListQuery {
  status?: BookingStatusType | "ALL";
  search?: string;
  serviceCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

/** Local filter state managed by UI controls. */
export interface BookingListFilters {
  status: BookingStatusType | "ALL";
  search: string;
  serviceCategory: string;
  dateFrom: string;
  dateTo: string;
}

/** Authoritative paginated bookings envelope returned by FastAPI backend. */
export interface PaginatedBookings {
  items: BookingRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Payload for admin status mutation endpoint (PATCH /api/bookings/admin/{id}/status). */
export interface BookingStatusUpdatePayload {
  status: BookingStatusType;
  version?: number;
}

/** Authoritative response for payment reconciliation endpoint (POST /api/payments/admin/reconcile-sync/{ref}). */
export interface PaymentReconcileResponse {
  reconciled: boolean;
  status: string;
  gateway_status?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/** Authoritative response for notification retry endpoint (POST /api/payments/admin/notifications/retry/{ref}). */
export interface NotificationRetryResponse {
  message: string;
}

/** Result shape for operational mutations. */
export interface MutationResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  status?: number;
  isConcurrencyConflict?: boolean;
}

export interface DeletionLogRecord {
  id: string;
  action: string;
  bookingRef?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  passengerName?: string | null;
  passengerEmail?: string | null;
  originalDeletedByUserId?: string | null;
  originalDeletedByEmail?: string | null;
  createdAt?: string | null;
  details?: Record<string, unknown>;
}

export interface PaginatedDeletionLog {
  items: DeletionLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
