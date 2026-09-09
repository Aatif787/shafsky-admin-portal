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
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Charter Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {unavailable ? "Service status unknown" : `${total.toLocaleString()} enquiries`}
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

      {error && (
        <div className="border border-slate-200 bg-white rounded-2xl p-8 text-center space-y-3 shadow-xs max-w-md mx-auto">
          <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">{error}</p>
          <p className="text-xs text-slate-500 font-medium">
            No charter enquiries are shown while this service is unavailable.
          </p>
          <button
            type="button"
            onClick={() => loadData()}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            Retry Connection
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
