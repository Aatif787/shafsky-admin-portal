/**
 * Operations Dashboard API Layer — Phase 20
 * Consolidated real-time metrics, charter desk, airport operations queue, and audit logs.
 */

import { apiFetch } from "./client";
import type {
  DashboardData,
  DashboardMetrics,
  BookingRecord,
  AuditLogRecord,
} from "../types/dashboard";
import type { CharterDeskMetrics, CharterRequestRecord } from "../types/charter";
import type { OperationsSummaryMetrics, OperationsQueueItem } from "../types/operations";

/**
 * Fetches consolidated dashboard data in parallel using lightweight queries.
 */
export async function fetchDashboardData(): Promise<{ data: DashboardData | null; error: string | null }> {
  try {
    const [
      dashboardRes,
      dailyReportRes,
      recentBookingsRes,
      attentionRes,
      auditLogsRes,
      charterRes,
      operationsRes,
    ] = await Promise.all([
      apiFetch<any>("/api/admin/dashboard"),
      apiFetch<any>("/api/admin/reports/daily"),
      apiFetch<any>("/api/bookings/admin/list?page=1&pageSize=15"),
      apiFetch<any>("/api/bookings/admin/list?status=PENDING&page=1&pageSize=10"),
      apiFetch<AuditLogRecord[]>("/api/admin/audit-logs?limit=10"),
      apiFetch<any>("/api/v1/admin/charter/requests?limit=100"),
      apiFetch<any>("/api/operations/queue"),
    ]);

    if (dashboardRes.error && recentBookingsRes.error && operationsRes.error) {
      return {
        data: null,
        error: dashboardRes.error || recentBookingsRes.error || "Failed to load dashboard data.",
      };
    }

    const rawDashboard = dashboardRes.data || {};
    const rawDaily = dailyReportRes.data || {};

    const recentBookings: BookingRecord[] = Array.isArray(recentBookingsRes.data)
      ? recentBookingsRes.data
      : (recentBookingsRes.data?.items || []);

    const attentionItems: BookingRecord[] = Array.isArray(attentionRes.data)
      ? attentionRes.data
      : (attentionRes.data?.items || []);

    const pendingTotal =
      attentionRes.data?.total !== undefined
        ? Number(attentionRes.data.total)
        : attentionItems.length;

    const auditLogs: AuditLogRecord[] = Array.isArray(auditLogsRes.data) ? auditLogsRes.data : [];

    const confirmedCount = Number(
      rawDashboard.confirmedToday ?? rawDaily.confirmedBookings ?? 0
    );

    const metrics: DashboardMetrics = {
      dailyRevenueINR: Number(rawDashboard.dailyRevenueINR ?? rawDaily.dailyRevenueINR ?? 0),
      todayBookings: Number(rawDashboard.todayBookings ?? rawDaily.totalBookings ?? 0),
      completedToday: Number(rawDashboard.completedToday ?? rawDaily.completedBookings ?? 0),
      confirmedToday: confirmedCount,
      pendingBookings: Number(rawDashboard.pendingBookings ?? pendingTotal),
      pendingPayments: Number(rawDashboard.pendingPayments ?? 0),
    };

    // Calculate Charter Desk Metrics
    const charterList: CharterRequestRecord[] = charterRes.error
      ? []
      : Array.isArray(charterRes.data?.items)
        ? charterRes.data.items
        : Array.isArray(charterRes.data?.data)
        ? charterRes.data.data
        : Array.isArray(charterRes.data)
          ? charterRes.data
          : [];

    const todayStr = new Date().toISOString().split("T")[0];
    const charterMetrics: CharterDeskMetrics = {
      newEnquiries: charterList.filter((r) => (r.status || "").toUpperCase() === "REQUESTED").length,
      awaitingQuote: charterList.filter((r) =>
        ["UNDER_REVIEW", "AIRCRAFT_SEARCH", "OPTIONS_PREPARED", "QUOTE_PREPARED"].includes(
          (r.status || "").toUpperCase()
        )
      ).length,
      confirmedToday: charterList.filter((r) => {
        if ((r.status || "").toUpperCase() !== "CONFIRMED") return false;
        const day = String(r.updated_at || r.created_at || "").slice(0, 10);
        return day === todayStr;
      }).length,
      totalActive: charterList.filter(
        (r) => !["CLOSED", "CANCELLED"].includes((r.status || "").toUpperCase())
      ).length,
    };

    // Calculate Airport Operations Metrics
    const opsList: OperationsQueueItem[] = Array.isArray(operationsRes.data?.data)
      ? operationsRes.data.data
      : Array.isArray(operationsRes.data)
      ? operationsRes.data
      : [];

    const operationsMetrics: OperationsSummaryMetrics = {
      newCount: opsList.filter((i) => (i.status || "").toUpperCase() === "NEW").length,
      assignedCount: opsList.filter((i) => (i.status || "").toUpperCase() === "ASSIGNED").length,
      inProgressCount: opsList.filter((i) => (i.status || "").toUpperCase() === "IN_PROGRESS").length,
      todayCount: opsList.filter(
        (i) => i.service_date === todayStr && !["COMPLETED", "CANCELLED"].includes((i.status || "").toUpperCase())
      ).length,
      totalActive: opsList.filter(
        (i) => !["COMPLETED", "CANCELLED"].includes((i.status || "").toUpperCase())
      ).length,
    };

    const dashboardData: DashboardData = {
      metrics,
      charterMetrics,
      operationsMetrics,
      recentBookings: recentBookings.slice(0, 15),
      attentionItems: attentionItems.slice(0, 10),
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
