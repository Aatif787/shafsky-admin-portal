/**
 * Private Charter Desk API Layer — Phase 19B
 * Interfaces with FastAPI `/api/v1/admin/charter/requests` endpoints.
 */

import { apiFetch } from "./client";
import type {
  CharterRequestRecord,
  CharterListQuery,
  PaginatedCharterRequests,
  CharterAdminUpdatePayload,
  CharterPriority,
} from "../types/charter";
import { parseApiError } from "./bookings";

/**
 * Derives operational priority for a charter inquiry based on departure urgency, pax count, and aircraft preference.
 */
export function computeCharterPriority(record: CharterRequestRecord): CharterPriority {
  try {
    if (!record.departure_date) return "STANDARD";
    const depDate = new Date(record.departure_date);
    const now = new Date();
    const diffHours = (depDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 0 && diffHours <= 48) {
      return "URGENT";
    }

    const paxTotal = record.passengers?.total ?? record.passengers?.adults ?? 1;
    const isHeavyJet =
      (record.aircraft_preference || "").toUpperCase().includes("HEAVY") ||
      (record.aircraft_preference || "").toUpperCase().includes("ULTRA");

    if ((diffHours > 48 && diffHours <= 120) || paxTotal >= 8 || isHeavyJet) {
      return "HIGH";
    }

    if (diffHours > 120 && diffHours <= 336) {
      return "MEDIUM";
    }

    return "STANDARD";
  } catch {
    return "STANDARD";
  }
}

/**
 * Fetches server-paginated and filtered private charter inquiries from backend.
 */
export async function fetchAdminCharterRequests(
  query: CharterListQuery = {},
  signal?: AbortSignal
): Promise<{ data: PaginatedCharterRequests | null; error: string | null }> {
  try {
    const params = new URLSearchParams();

    const skip = query.skip && query.skip >= 0 ? query.skip : 0;
    const limit = query.limit && query.limit >= 1 ? Math.min(query.limit, 100) : 25;

    params.set("skip", String(skip));
    params.set("limit", String(limit));

    if (query.status && query.status !== "ALL") {
      params.set("status", query.status);
    }
    if (query.search && query.search.trim()) {
      params.set("search", query.search.trim());
    }

    const queryString = params.toString();
    const path = `/api/v1/admin/charter/requests?${queryString}`;

    const res = await apiFetch<any>(path, { signal });

    if (res.error) {
      return { data: null, error: res.error };
    }

    const raw = res.data;

    if (raw && Array.isArray(raw.data)) {
      let items: CharterRequestRecord[] = raw.data;

      // Filter by derived priority client-side if priority filter is specified
      if (query.priority && query.priority !== "ALL") {
        items = items.filter((item) => computeCharterPriority(item) === query.priority);
      }

      return {
        data: {
          items,
          total: Number(raw.total ?? raw.data.length),
          skip: Number(raw.skip ?? skip),
          limit: Number(raw.limit ?? limit),
        },
        error: null,
      };
    }

    return {
      data: {
        items: [],
        total: 0,
        skip: 0,
        limit: 25,
      },
      error: null,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { data: null, error: null };
    }
    return {
      data: null,
      error: err?.message || "Failed to load charter requests.",
    };
  }
}

/**
 * Fetches full details for a single private charter request.
 */
export async function fetchAdminCharterDetail(
  id: string
): Promise<{ data: CharterRequestRecord | null; error: string | null }> {
  try {
    const res = await apiFetch<any>(`/api/v1/admin/charter/requests/${encodeURIComponent(id)}`);

    if (res.error) {
      return { data: null, error: res.error };
    }

    const data = res.data?.data || res.data;
    return { data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Failed to load charter request details.",
    };
  }
}

/**
 * Updates status, operator assignment, or internal notes on a private charter request:
 * PATCH /api/v1/admin/charter/requests/{id}
 */
export async function updateAdminCharterRequest(
  id: string,
  payload: CharterAdminUpdatePayload
): Promise<{ success: boolean; data: CharterRequestRecord | null; error: string | null }> {
  try {
    const res = await apiFetch<any>(`/api/v1/admin/charter/requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (res.error) {
      const parsed = parseApiError(res.status, res.error, "Failed to update charter inquiry.");
      return {
        success: false,
        data: null,
        error: parsed.message,
      };
    }

    const updated = res.data?.data || res.data;
    return {
      success: true,
      data: updated,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err?.message || "An unexpected error occurred updating charter inquiry.",
    };
  }
}
