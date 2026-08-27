/**
 * Operations Dashboard API Layer
 * Fetches real operational metrics, bookings list, and audit logs from FastAPI backend.
 */

import { apiFetch } from "./client";
import type { DashboardData, DashboardMetrics, BookingRecord, AuditLogRecord } from "../types/dashboard";

/**
 * Fetches consolidated dashboard data in parallel to avoid N+1 queries.
 */
export async function fetchDashboardData(): Promise<{ data: DashboardData | null; error: string | null }> {
  try {
    const [dashboardRes, dailyReportRes, bookingsRes, auditLogsRes] = await Promise.all([
      apiFetch<any>("/api/admin/dashboard"),
      apiFetch<any>("/api/admin/reports/daily"),
      apiFetch<BookingRecord[]>("/api/bookings/admin/list"),
      apiFetch<AuditLogRecord[]>("/api/admin/audit-logs?limit=10"),
    ]);

    if (dashboardRes.error && bookingsRes.error) {
      return {
        data: null,
        error: dashboardRes.error || bookingsRes.error || "Failed to load dashboard data.",
      };
    }

    const rawDashboard = dashboardRes.data || {};
    const rawDaily = dailyReportRes.data || {};
    const allBookings: BookingRecord[] = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
    const auditLogs: AuditLogRecord[] = Array.isArray(auditLogsRes.data) ? auditLogsRes.data : [];

    // Calculate pending and confirmed counts from authoritative bookings list
    const pendingCount = allBookings.filter(
      (b) => (b.status || "").toUpperCase() === "PENDING"
    ).length;

    const confirmedCount = rawDaily.confirmedBookings !== undefined
      ? rawDaily.confirmedBookings
      : allBookings.filter((b) => (b.status || "").toUpperCase() === "CONFIRMED").length;

    // Filter attention items: Bookings awaiting payment or confirmation
    const attentionItems = allBookings
      .filter((b) => {
        const s = (b.status || "").toUpperCase();
        return s === "PENDING" || (b.metadataJson?.payment_status || "").toUpperCase() === "PENDING";
      })
      .slice(0, 10);

    const metrics: DashboardMetrics = {
      dailyRevenueINR: Number(rawDashboard.dailyRevenueINR ?? rawDaily.dailyRevenueINR ?? 0),
      todayBookings: Number(rawDashboard.todayBookings ?? rawDaily.totalBookings ?? 0),
      completedToday: Number(rawDashboard.completedToday ?? rawDaily.completedBookings ?? 0),
      confirmedToday: Number(confirmedCount),
      pendingBookings: pendingCount,
      pendingPayments: pendingCount,
    };

    const dashboardData: DashboardData = {
      metrics,
      recentBookings: allBookings.slice(0, 15),
      attentionItems,
      auditLogs: auditLogs.slice(0, 8),
      lastUpdated: new Date().toISOString(),
    };

    return {
      data: dashboardData,
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "An unexpected error occurred loading dashboard data.",
    };
  }
}
