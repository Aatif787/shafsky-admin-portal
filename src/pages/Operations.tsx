import React, { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { fetchOperationsQueue, deriveOperationsPriority } from "../api/operations";
import type { OperationsQueueItem } from "../types/operations";
import { OperationsFilters } from "../components/operations/OperationsFilters";
import { OperationsTable } from "../components/operations/OperationsTable";
import { formatOperationalDateTime } from "../lib/dateUtils";

export const Operations: React.FC = () => {
  const [items, setItems] = useState<OperationsQueueItem[]>([]);
  const [airport, setAirport] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState(new Date().toISOString());

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadData = useCallback(
    async (isManual = false) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const res = await fetchOperationsQueue(
        { airport, status, search, serviceDate },
        controller.signal
      );
      if (!isMountedRef.current) return;

      if (res.error) {
        setError("Unable to connect to operations service.");
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

  useEffect(() => {
    const interval = setInterval(() => loadData(), 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const todayStr = new Date().toISOString().split("T")[0];
  const urgentCount = items.filter((i) => deriveOperationsPriority(i) === "URGENT").length;
  const unassignedCount = items.filter(
    (i) =>
      (!i.assigned_staff_name || !i.assigned_staff_name.trim()) &&
      i.status !== "COMPLETED" &&
      i.status !== "CANCELLED"
  ).length;
  const inProgressCount = items.filter((i) => i.status === "IN_PROGRESS").length;
  const todayCount = items.filter(
    (i) => i.service_date === todayStr && i.status !== "COMPLETED" && i.status !== "CANCELLED"
  ).length;
  const completedCount = items.filter((i) => i.status === "COMPLETED").length;

  const kpis = [
    { label: "Today's Flights", value: todayCount, accent: "border-l-4 border-l-slate-400" },
    { label: "Unassigned", value: unassignedCount, accent: "border-l-4 border-l-orange-500" },
    { label: "In Progress", value: inProgressCount, accent: "border-l-4 border-l-lime-600" },
    { label: "Urgent Flights", value: urgentCount, accent: "border-l-4 border-l-rose-500" },
    { label: "Completed", value: completedCount, accent: "border-l-4 border-l-emerald-500" },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Operations Desk</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-50 text-lime-800 border border-lime-200 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-600 animate-pulse" />
              Live Ops Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time airport ground handling, duty officer triage, and dispatch execution · Last synced {formatOperationalDateTime(lastSync)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between ${kpi.accent}`}
          >
            <div className="text-xs font-semibold text-slate-500">{kpi.label}</div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            {error}
          </div>
          <button type="button" onClick={() => loadData()} className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline">
            Retry
          </button>
        </div>
      )}

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

      <OperationsTable items={items} isLoading={isLoading} />
    </div>
  );
};
