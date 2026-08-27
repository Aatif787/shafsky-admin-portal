/**
 * Operations Page — Phase 20
 * Airport Ground Services Command & Dispatch Queue (/operations).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radio,
  RefreshCw,
  AlertTriangle,
  Flame,
  UserX,
  Calendar,
  Clock,
} from "lucide-react";
import { fetchOperationsQueue, deriveOperationsPriority } from "../api/operations";
import type { OperationsQueueItem } from "../types/operations";
import { OperationsFilters } from "../components/operations/OperationsFilters";
import { OperationsTable } from "../components/operations/OperationsTable";
import { formatOperationalDateTime } from "../lib/dateUtils";

export const Operations: React.FC = () => {
  const [items, setItems] = useState<OperationsQueueItem[]>([]);
  const [airport, setAirport] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [serviceDate, setServiceDate] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString());

  // Current live IST time
  const [currentTimeIST, setCurrentTimeIST] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const istString = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);
        setCurrentTimeIST(`${istString} IST`);
      } catch {
        setCurrentTimeIST(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadData = useCallback(
    async (isManual = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const res = await fetchOperationsQueue(
        {
          airport,
          status,
          search,
          serviceDate,
        },
        controller.signal
      );

      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setItems(res.data);
        setLastSync(new Date().toISOString());
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [airport, status, search, serviceDate]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Tab focus refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadData]);

  // Compute Attention Strip statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const urgentCount = items.filter((i) => deriveOperationsPriority(i) === "URGENT").length;
  const unassignedCount = items.filter(
    (i) => (!i.assigned_staff_name || !i.assigned_staff_name.trim()) && i.status !== "COMPLETED" && i.status !== "CANCELLED"
  ).length;
  const todayCount = items.filter((i) => i.service_date === todayStr && i.status !== "COMPLETED" && i.status !== "CANCELLED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header with Live IST Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-gold/10 border border-aviation-gold/30 text-aviation-gold">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Operations Queue
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Airport Ground Services Execution Desk
            </p>
          </div>
        </div>

        {/* Live IST clock & refresh button */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <div className="bg-aviation-850 px-3 py-1.5 rounded-lg border border-aviation-800 flex items-center gap-2 font-mono text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-aviation-gold" />
            <span>{currentTimeIST || "Live IST"}</span>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-aviation-850 hover:bg-aviation-800 border border-aviation-800 transition-colors disabled:opacity-50 select-none cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Queue"}</span>
          </button>
        </div>
      </div>

      {/* 2. Attention Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Urgent Attention */}
        <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Urgent Attention
              </span>
              <span className="text-sm font-bold text-red-300 font-mono">
                {urgentCount} Services
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Approaching / Active</span>
        </div>

        {/* Unassigned */}
        <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserX className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Unassigned Officers
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {unassignedCount} Unassigned
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Needs Assignment</span>
        </div>

        {/* Today's Services */}
        <div className="bg-aviation-900 border border-aviation-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Today's Operations
              </span>
              <span className="text-sm font-bold text-sky-300 font-mono">
                {todayCount} Scheduled
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Airside Execution</span>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="text-xs font-medium text-red-300 hover:text-white underline font-mono"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Queue Filter Bar */}
      <OperationsFilters
        search={search}
        onSearchChange={setSearch}
        airport={airport}
        onAirportChange={setAirport}
        status={status}
        onStatusChange={setStatus}
        serviceDate={serviceDate}
        onServiceDateChange={setServiceDate}
        totalCount={items.length}
      />

      {/* 5. Operations Table */}
      <OperationsTable items={items} isLoading={isLoading} />

      {/* Sync footer */}
      <div className="text-right text-[10px] font-mono text-slate-500">
        Last synchronized: {formatOperationalDateTime(lastSync)}
      </div>
    </div>
  );
};
