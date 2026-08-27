/**
 * Private Charter Desk Types — Phase 19B
 * Matches FastAPI backend models & schema definitions.
 */

export type CharterRequestStatus =
  | "REQUESTED"
  | "CONTACTED"
  | "UNDER_REVIEW"
  | "AIRCRAFT_SEARCH"
  | "OPTIONS_PREPARED"
  | "QUOTE_PREPARED"
  | "QUOTE_SENT"
  | "CUSTOMER_REVIEW"
  | "CONFIRMED"
  | "CLOSED"
  | "CANCELLED";

export type CharterPriority = "URGENT" | "HIGH" | "MEDIUM" | "STANDARD";

export interface CharterItineraryLeg {
  origin: string;
  destination: string;
  departure_date: string;
  departure_time?: string | null;
}

export interface CharterPassengers {
  adults: number;
  children?: number;
  infants?: number;
  total?: number;
}

export interface CharterRequestRecord {
  id: string;
  request_reference: string;
  customer_name: string;
  country_code: string;
  phone: string;
  email: string;
  company?: string | null;
  preferred_contact_method: string;
  trip_type: string;
  origin: string;
  destination: string;
  departure_date: string;
  departure_time?: string | null;
  return_date?: string | null;
  return_time?: string | null;
  itinerary: CharterItineraryLeg[];
  passengers: CharterPassengers;
  aircraft_preference: string;
  travel_requirements: string[];
  special_requests?: string | null;
  status: CharterRequestStatus;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  internal_notes?: string | null;
  client_ip?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharterListQuery {
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
  priority?: CharterPriority | "ALL";
}

export interface PaginatedCharterRequests {
  items: CharterRequestRecord[];
  total: number;
  skip: number;
  limit: number;
}

export interface CharterAdminUpdatePayload {
  status?: CharterRequestStatus;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  internal_notes?: string | null;
}

export interface CharterDeskMetrics {
  newEnquiries: number;
  awaitingQuote: number;
  confirmedToday: number;
  totalActive: number;
}
