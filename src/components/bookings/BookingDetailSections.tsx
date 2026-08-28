/**
 * BookingDetailSections — Phase 18
 * Card-based read-only sections for the booking detail page.
 * Renders: Overview, Customer, Flight, Service, Financial, Notes, Metadata.
 */

import React from "react";
import {
  Plane,
  User,
  CreditCard,
  Package,
  FileText,
  Tag,
  Hash,
  Info,
} from "lucide-react";
import type { BookingRecord } from "../../types/dashboard";
import { BookingStatusBadge } from "./BookingStatusBadge";
import {
  formatOperationalDateTime,
  formatOperationalDate,
  formatOperationalTime,
  formatCurrencyINR,
} from "../../lib/dateUtils";

/* ═══════════════════════════════════════════
   Section Card Wrapper
   ═══════════════════════════════════════════ */

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => (
  <div className="bg-aviation-900 border border-aviation-800 rounded-md overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-aviation-800">
      {icon}
      <h3 className="text-[12px] font-semibold text-slate-200">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════
   Field Row
   ═══════════════════════════════════════════ */

interface FieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, mono }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
      {label}
    </span>
    <span
      className={`text-sm text-white ${
        mono ? "font-mono tracking-wide" : ""
      }`}
    >
      {value || <span className="text-slate-600">—</span>}
    </span>
  </div>
);

/* ═══════════════════════════════════════════
   Overview Section
   ═══════════════════════════════════════════ */

export const OverviewSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => (
  <SectionCard title="Overview" icon={<Hash className="h-4 w-4 text-aviation-gold" />}>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <Field label="Booking Ref" value={booking.bookingRef} mono />
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Status
        </span>
        <BookingStatusBadge status={booking.status} size="md" />
      </div>
      <Field label="Created" value={formatOperationalDateTime(booking.createdAt)} />
      <Field label="Version" value={`v${booking.version}`} mono />
      <Field label="Service Category" value={booking.serviceCategory} />
      <Field label="Service Type" value={booking.serviceType} />
      <Field
        label="Channel"
        value={booking.metadataJson?.channel || "web"}
      />
      <Field label="ID" value={booking.id} mono />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════
   Customer Section
   ═══════════════════════════════════════════ */

export const CustomerSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => (
  <SectionCard title="Customer" icon={<User className="h-4 w-4 text-sky-400" />}>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <Field label="Passenger Name" value={booking.passengerName} />
      <Field label="Email" value={booking.passengerEmail} mono />
      <Field label="Phone" value={booking.passengerPhone} mono />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════
   Flight Section
   ═══════════════════════════════════════════ */

export const FlightSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => (
  <SectionCard title="Flight Information" icon={<Plane className="h-4 w-4 text-violet-400" />}>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <Field label="Flight Number" value={booking.flightNum} mono />
      <Field label="Origin" value={booking.originCode} mono />
      <Field label="Destination" value={booking.destCode} mono />
      <Field
        label="Flight Type"
        value={booking.metadataJson?.flight_type}
      />
      <Field
        label="Departure"
        value={
          booking.departureTime ? (
            <span>
              <span className="text-white">{formatOperationalDate(booking.departureTime)}</span>
              <span className="text-slate-400 ml-1.5">
                {formatOperationalTime(booking.departureTime)}
              </span>
            </span>
          ) : null
        }
      />
      <Field
        label="Arrival"
        value={
          booking.arrivalTime ? (
            <span>
              <span className="text-white">{formatOperationalDate(booking.arrivalTime)}</span>
              <span className="text-slate-400 ml-1.5">
                {formatOperationalTime(booking.arrivalTime)}
              </span>
            </span>
          ) : null
        }
      />
      <Field
        label="Terminal"
        value={booking.metadataJson?.terminal}
      />
      <Field
        label="Journey Type"
        value={booking.metadataJson?.journey_type}
      />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════
   Service Section
   ═══════════════════════════════════════════ */

export const ServiceSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => {
  const services = booking.selectedServices || {};
  const options = booking.serviceOptions || {};
  const hasServices = Object.keys(services).length > 0 || Object.keys(options).length > 0;

  return (
    <SectionCard title="Service Details" icon={<Package className="h-4 w-4 text-amber-400" />}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <Field label="Package / Tier" value={booking.metadataJson?.package || booking.serviceType} />
          <Field label="Service Airport" value={booking.metadataJson?.service_airport} mono />
          <Field label="Journey Type" value={booking.metadataJson?.journey_type} />
        </div>

        {hasServices && (
          <div className="border-t border-aviation-800 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-3">
              Selected Services & Options
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries({ ...services, ...options }).map(([key, val]) => {
                if (val === false || val === null || val === undefined) return null;
                const label = key
                  .replace(/_/g, " ")
                  .replace(/([A-Z])/g, " $1")
                  .trim();
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-aviation-800 border border-aviation-700 rounded-md text-xs text-slate-300"
                  >
                    <Tag className="h-3 w-3 text-aviation-gold" />
                    <span className="capitalize">{label}</span>
                    {typeof val === "string" || typeof val === "number" ? (
                      <span className="text-aviation-gold font-mono ml-1">({String(val)})</span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

/* ═══════════════════════════════════════════
   Financial Section
   ═══════════════════════════════════════════ */

export const FinancialSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => (
  <SectionCard title="Financial" icon={<CreditCard className="h-4 w-4 text-emerald-400" />}>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Total Amount
        </span>
        <span className="text-lg font-mono font-bold text-aviation-gold">
          {formatCurrencyINR(booking.totalAmount)}
        </span>
      </div>
      <Field label="Currency" value={booking.currency} mono />
      <Field
        label="Payment Status"
        value={
          booking.metadataJson?.payment_status ? (
            <span
              className={`font-semibold uppercase text-xs ${
                (booking.metadataJson.payment_status || "").toUpperCase() === "PAID" ||
                (booking.metadataJson.payment_status || "").toUpperCase() === "SUCCESSFUL"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {booking.metadataJson.payment_status}
            </span>
          ) : null
        }
      />
      <Field
        label="Booking Status"
        value={<BookingStatusBadge status={booking.status} size="md" />}
      />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════
   Notes Section
   ═══════════════════════════════════════════ */

export const NotesSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => {
  if (!booking.notes) return null;

  return (
    <SectionCard title="Internal Notes" icon={<FileText className="h-4 w-4 text-slate-400" />}>
      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
        {booking.notes}
      </p>
    </SectionCard>
  );
};

/* ═══════════════════════════════════════════
   Metadata Section
   ═══════════════════════════════════════════ */

export const MetadataSection: React.FC<{ booking: BookingRecord }> = ({ booking }) => {
  const meta = booking.metadataJson || {};
  const entries = Object.entries(meta).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  if (entries.length === 0) return null;

  return (
    <SectionCard title="Metadata" icon={<Info className="h-4 w-4 text-slate-400" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-sm text-slate-300 font-mono break-all">
              {typeof val === "object" ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};
