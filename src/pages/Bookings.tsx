import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAdminBookings, recycleBooking } from "../api/bookings";
import { BookingsFilters } from "../components/bookings/BookingsFilters";
import { BookingsTable } from "../components/bookings/BookingsTable";
import { RecycleBookingModal } from "../components/bookings/BookingActionModals";
import type { BookingRecord } from "../types/dashboard";
import type { BookingListFilters } from "../types/booking";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "../auth/useAuth";

const PAGE_SIZE = 25;

const EMPTY_FILTERS: BookingListFilters = {
  status: "ALL",
  search: "",
  serviceCategory: "ALL",
  dateFrom: "",
  dateTo: "",
};

export const Bookings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const { role } = useAuth();
  const canRecycle = role === "ADMIN" || role === "SUPER_ADMIN";

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<BookingListFilters>({
    ...EMPTY_FILTERS,
    search: initialQ,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [recycleTarget, setRecycleTarget] = useState<BookingRecord | null>(null);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleError, setRecycleError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setFilters((prev) => (prev.search === q ? prev : { ...prev, search: q }));
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const prevKeyRef = useRef("");
  const filterKey = `${filters.status}|${debouncedSearch}|${filters.serviceCategory}|${filters.dateFrom}|${filters.dateTo}`;

  useEffect(() => {
    if (prevKeyRef.current && prevKeyRef.current !== filterKey) {
      setCurrentPage(1);
    }
    prevKeyRef.current = filterKey;
  }, [filterKey]);

  const loadBookings = useCallback(
    async (page: number, nextFilters: BookingListFilters, search: string) => {
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
          status: nextFilters.status,
          search,
          serviceCategory: nextFilters.serviceCategory,
          dateFrom: nextFilters.dateFrom,
          dateTo: nextFilters.dateTo,
        },
        controller.signal
      );

      if (controller.signal.aborted) return;

      if (res.error) {
        setError(
          res.error.toLowerCase().includes("session")
            ? "Your session has expired. Please sign in again."
            : "Unable to connect to operations service."
        );
      } else if (res.data) {
        setBookings(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }

      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    loadBookings(currentPage, filters, debouncedSearch);
    return () => abortControllerRef.current?.abort();
  }, [currentPage, filters.status, filters.serviceCategory, filters.dateFrom, filters.dateTo, debouncedSearch, loadBookings]);

  const handleRecycle = async () => {
    if (!recycleTarget || recycleLoading) return;
    setRecycleLoading(true);
    setRecycleError(null);
    const res = await recycleBooking(recycleTarget.bookingRef);
    setRecycleLoading(false);
    if (res.error) {
      setRecycleError(res.error);
      return;
    }
    setRecycleTarget(null);
    await loadBookings(currentPage, filters, debouncedSearch);
  };

  return (
    <div className="space-y-5 pb-8">
      <BookingsFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={total}
        isLoading={isLoading}
        onRefresh={() => loadBookings(currentPage, filters, debouncedSearch)}
      />

      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-rose-800">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadBookings(currentPage, filters, debouncedSearch)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:text-rose-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {recycleError && (
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-3 text-xs font-medium text-rose-800 shadow-xs">
          {recycleError}
        </div>
      )}

      {!error && (
        <BookingsTable
          bookings={bookings}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={total}
          onPageChange={(page) => {
            if (page >= 1 && page <= totalPages && page !== currentPage) {
              setCurrentPage(page);
            }
          }}
          isLoading={isLoading}
          canRecycle={canRecycle}
          onRecycle={(booking) => {
            setRecycleError(null);
            setRecycleTarget(booking);
          }}
        />
      )}

      {recycleTarget && (
        <RecycleBookingModal
          isOpen={Boolean(recycleTarget)}
          onClose={() => setRecycleTarget(null)}
          onConfirm={handleRecycle}
          booking={recycleTarget}
          isLoading={recycleLoading}
        />
      )}
    </div>
  );
};
