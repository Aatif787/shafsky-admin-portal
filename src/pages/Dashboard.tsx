import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { fetchDashboardData } from "../api/dashboard";
import type { DashboardData } from "../types/dashboard";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { SummaryCards } from "../components/dashboard/SummaryCards";
import { AttentionPanel } from "../components/dashboard/AttentionPanel";
import { UpcomingBookings } from "../components/dashboard/UpcomingBookings";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { Button } from "../components/ui/Button";

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    setError(null);

    const result = await fetchDashboardData();

    if (result.error && !data) {
      setError(result.error);
    } else if (result.data) {
      setData(result.data);
      setError(null);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, [data]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Periodic auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Refetch when window/tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadData]);

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-rose-900/40 bg-aviation-900/80 p-8 backdrop-blur-md space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold text-white">
              Unable to Load Operations Feed
            </h2>
            <p className="text-xs text-slate-400">
              {error || "Could not retrieve live booking and ledger data from FastAPI engine."}
            </p>
          </div>
          <div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsLoading(true);
                loadData(true);
              }}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header with Operational Context */}
      <DashboardHeader
        lastUpdated={data?.lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
      />

      {/* 2. Key Operational Metrics */}
      <SummaryCards
        metrics={data?.metrics}
        isLoading={isLoading}
      />

      {/* 3. Immediate Attention Queue */}
      <AttentionPanel
        items={data?.attentionItems || []}
        isLoading={isLoading}
      />

      {/* 4. Main Grid: Upcoming Bookings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingBookings
            bookings={data?.recentBookings || []}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentActivity
            logs={data?.auditLogs || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
