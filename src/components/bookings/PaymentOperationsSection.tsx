import React from "react";
import type { BookingRecord } from "../../types/dashboard";
import { formatOperationalDateTime, formatCurrencyINR } from "../../lib/dateUtils";

interface PaymentOperationsSectionProps {
  booking: BookingRecord;
  onOpenSync: () => void;
  isSyncing: boolean;
}

export const PaymentOperationsSection: React.FC<PaymentOperationsSectionProps> = ({
  booking,
  onOpenSync,
  isSyncing,
}) => {
  const meta = booking.metadataJson || {};
  const paymentStatusRaw = String(meta.payment_status || "PENDING").toUpperCase();
  const isPaid = paymentStatusRaw === "PAID" || paymentStatusRaw === "SUCCESSFUL";
  const razorpayOrderId = meta.razorpay_order_id || meta.order_id || null;
  const razorpayPaymentId = meta.razorpay_payment_id || meta.payment_id || null;
  const transactionId = meta.transaction_id || meta.transaction_ref || null;
  const paidAt = meta.paid_at || null;
  const channel = meta.channel || "Web Checkout";

  const row = (label: string, value: React.ReactNode, mono = false) => (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-aviation-800 last:border-0">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={`text-[12px] text-white break-all ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-slate-600">—</span>}
      </span>
    </div>
  );

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-aviation-800">
        <h3 className="text-[12px] font-semibold text-slate-200">Payment</h3>
      </div>
      <div className="p-4 space-y-1">
        {row("Payment status", paymentStatusRaw)}
        {row("Amount", formatCurrencyINR(booking.totalAmount))}
        {row("Currency", booking.currency, true)}
        {row("Razorpay Order ID", razorpayOrderId ? String(razorpayOrderId) : null, true)}
        {row("Razorpay Payment ID", razorpayPaymentId ? String(razorpayPaymentId) : null, true)}
        {row("Transaction ID", transactionId ? String(transactionId) : null, true)}
        {row(
          "Paid at",
          paidAt
            ? formatOperationalDateTime(String(paidAt))
            : isPaid
              ? formatOperationalDateTime(booking.createdAt)
              : null
        )}
        {row("Payment channel", String(channel))}
        <button
          type="button"
          onClick={onOpenSync}
          disabled={isSyncing}
          className="mt-3 w-full rounded-md border border-aviation-800 px-3 py-2 text-[12px] text-slate-200 hover:bg-aviation-850 disabled:opacity-50"
        >
          {isSyncing ? "Reconciling…" : "Reconcile with Razorpay"}
        </button>
      </div>
    </div>
  );
};
