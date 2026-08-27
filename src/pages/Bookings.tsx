/**
 * Bookings List Page — Phase 18.1
 * Authoritative Server-Side Paginated, Filtered & Debounced Operations Desk.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchAdminBookings } from "../api/bookings";
import { BookingsFilters } from "../components/bookings/BookingsFilters";
import { BookingsTable } from "../components/bookings/BookingsTable";
import type { BookingRecord } from "../types/dashboard";
import type { BookingListFilters } from "../types/booking";
import { AlertTriangle, RefreshCw } from "lucide-react";

const PAGE_SIZE = 25;

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<BookingListFilters>({
    status: "ALL",
    search: "",
  });

  // Debounce search term to prevent flooding the backend on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // When search or status filter changes, reset to page 1
  const prevFiltersRef = useRef({ status: filters.status, search: debouncedSearch });
  useEffect(() => {
    if (
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.search !== debouncedSearch
    ) {
      prevFiltersRef.current = { status: filters.status, search: debouncedSearch };
      setCurrentPage(1);
    }
  }, [filters.status, debouncedSearch]);

  const loadBookings = useCallback(async (page: number, status: string, search: string) => {
    // Abort previous in-flight request to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    const res = await fetchAdminBookings(
      {
        page,
        pageSize: PAGE_SIZE,
        status: status as BookingListFilters["status"],
        search,
      },
      controller.signal
    );

    // If aborted, do nothing
    if (controller.signal.aborted) {
      return;
    }

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setBookings(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    }

    setIsLoading(false);
  }, []);

  // Fetch whenever page, status, or debouncedSearch changes
  useEffect(() => {
    loadBookings(currentPage, filters.status, debouncedSearch);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, filters.status, debouncedSearch, loadBookings]);

  const handleFiltersChange = (newFilters: BookingListFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filters */}
      <BookingsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalCount={total}
        isLoading={isLoading}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Failed to load bookings</p>
            <p className="text-xs text-red-400/70 mt-1 font-mono">{error}</p>
          </div>
          <button
            onClick={() => loadBookings(currentPage, filters.status, debouncedSearch)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Server-Paginated Table */}
      {!error && (
        <BookingsTable
          bookings={bookings}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
