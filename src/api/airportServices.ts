import { apiFetch } from "./client";

export interface AirportServiceItem {
  id: string;
  airport_id: string;
  airport_code: string;
  airport_name: string;
  city: string;
  service_id: string;
  service_name: string;
  service_slug: string;
  price: number;
  currency: string;
  journey_type: "ARRIVAL" | "DEPARTURE" | "TRANSIT";
  flight_type: "DOMESTIC" | "INTERNATIONAL" | "ALL";
  terminal: string;
  is_available: boolean;
  features: string[];
  short_description: string;
  min_booking_notice_hours: number;
  updated_at: string | null;
  deleted_at?: string | null;
  deleted_by_email?: string | null;
  deleted_by_role?: string | null;
}

export interface ListAirportServicesParams {
  airport?: string;
  journey_type?: string;
  flight_type?: string;
  is_available?: boolean;
}

export async function fetchAirportServices(params: ListAirportServicesParams = {}) {
  const query = new URLSearchParams();
  if (params.airport) query.set("airport", params.airport);
  if (params.journey_type) query.set("journey_type", params.journey_type);
  if (params.flight_type) query.set("flight_type", params.flight_type);
  if (params.is_available !== undefined) query.set("is_available", String(params.is_available));

  const path = `/api/admin/airport-services${query.toString() ? `?${query.toString()}` : ""}`;
  return apiFetch<AirportServiceItem[]>(path, { method: "GET" });
}

export async function fetchRecycledAirportServices(params: { airport?: string; limit?: number; offset?: number } = {}) {
  const query = new URLSearchParams();
  if (params.airport) query.set("airport", params.airport);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const path = `/api/admin/airport-services/recycle-bin${query.toString() ? `?${query.toString()}` : ""}`;
  return apiFetch<AirportServiceItem[]>(path, { method: "GET" });
}

export async function updateAirportServicePrice(
  id: string,
  payload: {
    price?: number;
    currency?: string;
    is_available?: boolean;
    terminal?: string;
    features?: string[];
    short_description?: string;
    min_booking_notice_hours?: number;
  }
) {
  return apiFetch<AirportServiceItem>(`/api/admin/airport-services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function recycleAirportService(id: string) {
  return apiFetch<{ recycled: boolean; mapping_id: string }>(`/api/admin/airport-services/${id}/recycle`, {
    method: "POST",
  });
}

export async function restoreAirportService(id: string) {
  return apiFetch<{ restored: boolean; mapping_id: string }>(`/api/admin/airport-services/${id}/restore`, {
    method: "POST",
  });
}

export async function purgeAirportService(id: string) {
  return apiFetch<{ purged: boolean; mapping_id: string }>(`/api/admin/airport-services/${id}/purge`, {
    method: "DELETE",
  });
}
