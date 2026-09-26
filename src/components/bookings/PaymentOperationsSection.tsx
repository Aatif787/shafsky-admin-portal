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
    <div className="flex flex-col gap-1 py-2 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-xs text-slate-900 font-medium break-all ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-slate-400">—</span>}
      </span>
    </div>
  );

  const isIcici =
    meta.payment_gateway === "ICICI" ||
    String(channel).toLowerCase().includes("icici") ||
    (razorpayOrderId && !String(razorpayOrderId).startsWith("order_") && !String(razorpayOrderId).startsWith("plink_"));

  const gatewayName = isIcici ? "ICICI Bank" : "Razorpay";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Payment Reconciliation</h3>
      </div>
      <div className="p-4 space-y-1">
        {row(
          "Payment Status",
          <span
            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase border ${
              isPaid
                ? "bg-lime-50 text-lime-700 border-lime-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}
          >
            {paymentStatusRaw}
          </span>
        )}
        {row("Payment Gateway", <span className="font-semibold text-slate-800">{gatewayName}</span>)}
        {row("Amount", <span className="font-mono font-bold text-lime-700">{formatCurrencyINR(booking.totalAmount)}</span>)}
        {row("Currency", booking.currency, true)}
        {row(`${isIcici ? "ICICI" : "Razorpay"} Order ID`, razorpayOrderId ? String(razorpayOrderId) : null, true)}
        {row(`${isIcici ? "ICICI" : "Razorpay"} Payment ID`, razorpayPaymentId ? String(razorpayPaymentId) : null, true)}
        {row("Transaction ID", transactionId ? String(transactionId) : null, true)}
        {row(
          "Paid At",
          paidAt
            ? formatOperationalDateTime(String(paidAt))
            : isPaid
              ? formatOperationalDateTime(booking.createdAt)
              : null
        )}
        {row("Payment Channel", String(channel))}
        <button
          type="button"
          onClick={onOpenSync}
          disabled={isSyncing}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 transition-all"
        >
          {isSyncing ? "Reconciling…" : `Reconcile with ${gatewayName}`}
        </button>
      </div>
    </div>
  );
};
