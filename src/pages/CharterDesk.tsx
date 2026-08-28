import React, { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { fetchAdminCharterRequests } from "../api/charter";
import type { CharterRequestRecord, CharterPriority } from "../types/charter";
import { CharterFilters } from "../components/charter/CharterFilters";
import { CharterTable } from "../components/charter/CharterTable";

export const CharterDesk: React.FC = () => {
  const [items, setItems] = useState<CharterRequestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState<CharterPriority | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    async (isManualRefresh = false) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const res = await fetchAdminCharterRequests(
        { skip, limit, search, status, priority },
        controller.signal
      );
      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
        setItems([]);
        setTotal(0);
      } else if (res.data) {
        setItems(res.data.items);
        setTotal(res.data.total);
      }
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [skip, limit, search, status, priority]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unavailable = Boolean(error);

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-aviation-800 pb-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Charter Desk</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {unavailable ? "Service status unknown" : `${total.toLocaleString()} enquiries`}
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

      {error && (
        <div className="border border-aviation-800 bg-aviation-900 rounded-md p-8 text-center space-y-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
          <p className="text-[13px] text-white">{error}</p>
          <p className="text-[12px] text-slate-500">
            No charter enquiries are shown while this service is unavailable.
          </p>
          <button
            type="button"
            onClick={() => loadData()}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-aviation-800 px-3 py-1.5 text-[12px] text-slate-200"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <>
          <CharterFilters
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setSkip(0);
            }}
            status={status}
            onStatusChange={(val) => {
              setStatus(val);
              setSkip(0);
            }}
            priority={priority}
            onPriorityChange={(val) => {
              setPriority(val);
              setSkip(0);
            }}
            totalCount={total}
          />
          <CharterTable
            items={items}
            isLoading={isLoading}
            total={total}
            skip={skip}
            limit={limit}
            onPageChange={(newSkip) => setSkip(newSkip)}
          />
        </>
      )}
    </div>
  );
};
