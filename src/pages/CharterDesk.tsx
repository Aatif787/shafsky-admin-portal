/**
 * CharterDesk Page — Phase 19B
 * Private Charter Inquiries Operational Console (/charter).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plane, RefreshCw, AlertTriangle } from "lucide-react";
import { fetchAdminCharterRequests } from "../api/charter";
import type { CharterRequestRecord, CharterPriority } from "../types/charter";
import { CharterFilters } from "../components/charter/CharterFilters";
import { CharterTable } from "../components/charter/CharterTable";

export const CharterDesk: React.FC = () => {
  const [items, setItems] = useState<CharterRequestRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit] = useState<number>(25);

  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("ALL");
  const [priority, setPriority] = useState<CharterPriority | "ALL">("ALL");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

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
    async (isManualRefresh = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const res = await fetchAdminCharterRequests(
        {
          skip,
          limit,
          search,
          status,
          priority,
        },
        controller.signal
      );

      if (!isMountedRef.current) return;

      if (res.error) {
        setError(res.error);
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

  // Handle filter changes (resets pagination to skip = 0)
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setSkip(0);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setSkip(0);
  };

  const handlePriorityChange = (val: CharterPriority | "ALL") => {
    setPriority(val);
    setSkip(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviation-gold/10 border border-aviation-gold/30 text-aviation-gold">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Private Charter Desk
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Aviation Enquiries & Triage Desk
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={isLoading || isRefreshing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-aviation-850 hover:bg-aviation-800 border border-aviation-800 transition-colors disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Desk"}</span>
        </button>
      </div>

      {/* Error Banner */}
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

      {/* Filters */}
      <CharterFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        priority={priority}
        onPriorityChange={handlePriorityChange}
        totalCount={total}
      />

      {/* Inquiries Table */}
      <CharterTable
        items={items}
        isLoading={isLoading}
        total={total}
        skip={skip}
        limit={limit}
        onPageChange={(newSkip) => setSkip(newSkip)}
      />
    </div>
  );
};
