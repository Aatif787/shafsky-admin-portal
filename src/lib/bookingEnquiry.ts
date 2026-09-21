/**
 * Booking enquiry helpers — quote-only rows from /api/bookings/enquiries.
 */

import type { BookingRecord } from "../types/dashboard";

export function isQuoteEnquiry(booking: BookingRecord | null | undefined): boolean {
  if (!booking) return false;
  const meta = booking.metadataJson || {};
  if (meta.enquiry === true || meta.quote_only === true) return true;
  const selected = booking.selectedServices || {};
  if (selected.enquiry === true) return true;
  const amount = Number(booking.totalAmount ?? 0);
  const cat = (booking.serviceCategory || "").toLowerCase();
  const airportLike =
    cat.includes("airport") || cat.includes("meet");
  return amount === 0 && !airportLike && !booking.flightNum;
}

export function enquiryRouteLabel(booking: BookingRecord): string {
  const meta = booking.metadataJson || {};
  const origin =
    meta.origin_label ||
    booking.serviceOptions?.pickup_location ||
    booking.serviceOptions?.origin ||
    booking.originCode;
  const dest =
    meta.destination_label ||
    booking.serviceOptions?.dropoff_location ||
    booking.serviceOptions?.destination ||
    booking.destCode;
  if (origin && dest) return `${origin} → ${dest}`;
  if (origin || dest) return String(origin || dest);
  return "—";
}

export function enquiryServiceDate(booking: BookingRecord): string | null {
  const meta = booking.metadataJson || {};
  return (
    meta.service_date ||
    booking.serviceOptions?.service_date ||
    booking.departureTime ||
    null
  );
}
