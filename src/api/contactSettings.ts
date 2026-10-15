/**
 * API client methods for Website Contact Settings in Shafsky Admin Portal.
 */

import { apiFetch } from "./client";

export type ServiceKey =
  | "meet_greet_lounge"
  | "transport"
  | "hotel"
  | "private_charter"
  | "ticketing"
  | "contact";

export interface ContactSlotItem {
  slot_index: number;
  country_code: string;
  phone_number: string;
  full_phone_number: string;
  is_active: boolean;
}

export interface ServiceContactConfig {
  service_key: ServiceKey;
  service_name: string;
  slots: ContactSlotItem[];
}

export interface ContactSlotInput {
  slot_index: number;
  country_code: string;
  phone_number: string;
  is_active: boolean;
}

export interface ServiceContactUpdateItem {
  service_key: ServiceKey;
  slots: ContactSlotInput[];
}

export interface ContactSettingsUpdateRequest {
  services: ServiceContactUpdateItem[];
}

export async function fetchAdminContactSettings() {
  return apiFetch<ServiceContactConfig[]>("/api/admin/contact-settings", {
    method: "GET",
  });
}

export async function updateAdminContactSettings(payload: ContactSettingsUpdateRequest) {
  return apiFetch<ServiceContactConfig[]>("/api/admin/contact-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
