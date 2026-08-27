/**
 * Operations Queue Types — Phase 20
 * Airport Ground Operations & 7-Stage Workflow Engine.
 */

export type OperationsWorkflowStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "CUSTOMER_CONTACTED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type OperationsPriority = "URGENT" | "ATTENTION" | "NORMAL";

export interface OperationsQueueItem {
  id: string;
  booking_reference: string;
  airport_code: string;
  journey_type: string;
  service_date: string; // YYYY-MM-DD
  service_time: string; // HH:MM
  status: OperationsWorkflowStatus | string;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  guest_count: number;
  flight_number?: string | null;
  selected_services: Array<string | { name?: string; service?: string; [key: string]: any }>;
  special_requests?: string | null;
  email_notification_sent: boolean;
  whatsapp_notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface OperationsTimelineEntry {
  id?: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  title: string;
  details?: Record<string, any>;
  actor_id?: string | null;
  created_at: string;
}

export interface OperationsInternalNote {
  id: string;
  content: string;
  author_id?: string | null;
  created_at: string;
}

export interface OperationsDetailResponse {
  success: boolean;
  item: OperationsQueueItem;
  timeline: OperationsTimelineEntry[];
  internal_notes: OperationsInternalNote[];
}

export interface OperationsQueueFilters {
  status?: string;
  airport?: string;
  search?: string;
  serviceDate?: string;
}

export interface StatusUpdatePayload {
  status: OperationsWorkflowStatus;
  reason?: string;
  actor_id?: string;
}

export interface AssignStaffPayload {
  staff_id?: string;
  staff_name?: string;
  assigned_by?: string;
}

export interface InternalNotePayload {
  content: string;
  author_id?: string;
}

export interface OperationsSummaryMetrics {
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  todayCount: number;
  totalActive: number;
}
