import type { CharterDeskMetrics } from "./charter";
import type { OperationsSummaryMetrics } from "./operations";

export interface DashboardMetrics {
  dailyRevenueINR: number;
  todayBookings: number;
  completedToday: number;
  confirmedToday: number;
  pendingBookings: number;
  pendingPayments: number;
}

export interface BookingRecord {
  id: string;
  bookingRef: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone?: string | null;
  serviceCategory?: string;
  serviceType: string;
  flightNum?: string | null;
  originCode?: string | null;
  destCode?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  selectedServices?: Record<string, any>;
  serviceOptions?: Record<string, any>;
  metadataJson?: {
    terminal?: string;
    journey_type?: string;
    flight_type?: string;
    payment_status?: string;
    package?: string;
    service_airport?: string;
    channel?: string;
    [key: string]: any;
  };
  totalAmount: number;
  currency: string;
  status: "CONFIRMED" | "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  version: number;
  notes?: string | null;
  createdAt: string;
  deletedAt?: string | null;
  deletedByUserId?: string | null;
  deletedByEmail?: string | null;
  deletedByRole?: string | null;
}

export interface AuditLogRecord {
  id: string;
  actorEmail: string;
  actorRole?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, any>;
  timestamp: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charterMetrics?: CharterDeskMetrics;
  operationsMetrics?: OperationsSummaryMetrics;
  recentBookings: BookingRecord[];
  attentionItems: BookingRecord[];
  auditLogs: AuditLogRecord[];
  lastUpdated: string;
}
