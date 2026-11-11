/**
 * Super Admin client for WhatsApp notification recipients and service routes.
 * Uses the shared authenticated API client. Service keys come from the backend.
 */

import { apiFetch } from "./client";

export interface NotificationRecipient {
  id: string;
  label: string | null;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteAssignment {
  id: string;
  service_key: string;
  recipient_id: string;
  recipient_label: string | null;
  phone_number: string;
  is_active: boolean;
  recipient_is_active: boolean;
  effective: boolean;
}

export interface ServiceRouting {
  service_key: string;
  assignments: RouteAssignment[];
  effective_recipients: NotificationRecipient[];
}

export interface RecipientWrite {
  label?: string | null;
  phone_number?: string;
  is_active?: boolean;
}

export interface LiveRecipient {
  label: string;
  phone_number: string;
}

export interface RoutingSettings {
  routing_mode: string;
  settings_id: string;
  live_recipients: LiveRecipient[];
}

const BASE = "/api/admin/whatsapp-notifications";

export function fetchNotificationRecipients() {
  return apiFetch<NotificationRecipient[]>(`${BASE}/recipients`, { method: "GET" });
}

export function createNotificationRecipient(payload: RecipientWrite) {
  return apiFetch<NotificationRecipient>(`${BASE}/recipients`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateNotificationRecipient(recipientId: string, payload: RecipientWrite) {
  return apiFetch<NotificationRecipient>(`${BASE}/recipients/${recipientId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteNotificationRecipient(recipientId: string) {
  return apiFetch<{ deleted: boolean; recipient_id: string }>(`${BASE}/recipients/${recipientId}`, {
    method: "DELETE",
  });
}

export function fetchServiceRoutes() {
  return apiFetch<ServiceRouting[]>(`${BASE}/routes`, { method: "GET" });
}

export function fetchRoutingSettings() {
  return apiFetch<RoutingSettings>(`${BASE}/settings`, { method: "GET" });
}

export function saveServiceRoutes(
  serviceKey: string,
  recipientIds: string[]
) {
  return apiFetch<ServiceRouting>(`${BASE}/routes/${encodeURIComponent(serviceKey)}`, {
    method: "PUT",
    body: JSON.stringify({
      assignments: recipientIds.map((recipient_id) => ({ recipient_id, is_active: true })),
    }),
  });
}
