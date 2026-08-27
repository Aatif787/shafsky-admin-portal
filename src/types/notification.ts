/**
 * Notification & Communication Center Types — Phase 21
 * Authoritative types for `notification_records` and delivery audit.
 */

export type NotificationChannel =
  | "EMAIL"
  | "WHATSAPP"
  | "ALL"
  | "EMAIL_ONLY"
  | "WHATSAPP_ONLY"
  | "BYPASSED"
  | string;

export type NotificationStatus =
  | "QUEUED"
  | "SENDING"
  | "DELIVERED"
  | "FAILED"
  | "BYPASSED"
  | "OPENED"
  | "READ"
  | "PENDING"
  | string;

export interface NotificationRecordItem {
  id: string;
  channel: NotificationChannel;
  templateType: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  status: NotificationStatus;
  attempts: number;
  maxAttempts: number;
  messageId?: string | null;
  errorLog?: string | null;
  deliveredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BookingNotificationsResponse {
  success: boolean;
  data: NotificationRecordItem[];
  error?: string | null;
}
