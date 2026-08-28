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
    { label: "Today's flights", value: todayCount },
    { label: "Unassigned", value: unassignedCount },
    { label: "In progress", value: inProgressCount },
    { label: "Urgent", value: urgentCount },
    { label: "Completed", value: completedCount },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-aviation-800 pb-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Operations</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Last synced {formatOperationalDateTime(lastSync)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-aviation-900 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px overflow-hidden rounded-md border border-aviation-800 bg-aviation-800">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-aviation-900 px-4 py-3">
            <div className="text-[11px] text-slate-500">{kpi.label}</div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="border border-rose-900/60 bg-rose-950/20 rounded-md p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
          <button type="button" onClick={() => loadData()} className="text-[12px] text-slate-200 underline">
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
