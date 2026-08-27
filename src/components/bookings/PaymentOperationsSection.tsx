/**
 * PaymentOperationsSection — Phase 19A
 * Dedicated Payment Operations Panel with Razorpay Gateway Synchronization.
 */

import React from "react";
import { CreditCard, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
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
  const isFailed = paymentStatusRaw === "FAILED" || paymentStatusRaw === "EXPIRED";
  const isRefunded = paymentStatusRaw === "REFUNDED";

  const getStatusBadge = () => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" />
          PAID
        </span>
      );
    }
    if (isRefunded) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
          REFUNDED
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
          <AlertCircle className="h-3 w-3" />
          FAILED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        PENDING
      </span>
    );
  };

  const razorpayOrderId = meta.razorpay_order_id || meta.order_id || null;
  const razorpayPaymentId = meta.razorpay_payment_id || meta.payment_id || null;
  const transactionId = meta.transaction_id || meta.transaction_ref || null;
  const paidAt = meta.paid_at || null;
  const channel = meta.channel || "Web Checkout";

  return (
    <div className="bg-aviation-900 border border-aviation-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-aviation-800 bg-aviation-850/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aviation-800">
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
            Payment & Gateway Operations
          </h3>
        </div>

        {/* Sync Button */}
        <button
          type="button"
          onClick={onOpenSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-aviation-gold hover:text-aviation-950 bg-aviation-gold/10 hover:bg-aviation-gold border border-aviation-gold/30 hover:border-aviation-gold transition-all disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Payment"}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Amount & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-aviation-850/60 border border-aviation-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
              Total Amount
            </span>
            <span className="text-xl font-mono font-bold text-aviation-gold">
              {formatCurrencyINR(booking.totalAmount)}
            </span>
            <span className="text-xs text-slate-400 font-mono ml-2">({booking.currency})</span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Gateway Status
            </span>
            {getStatusBadge()}
          </div>
        </div>

        {/* Gateway Identifier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Razorpay Order ID
            </span>
            <span className="text-white font-mono break-all">
              {razorpayOrderId ? String(razorpayOrderId) : <span className="text-slate-600">—</span>}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Razorpay Payment ID
            </span>
            <span className="text-white font-mono break-all">
              {razorpayPaymentId ? (
                String(razorpayPaymentId)
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Transaction ID
            </span>
            <span className="text-slate-300 font-mono break-all">
              {transactionId ? String(transactionId) : <span className="text-slate-600">—</span>}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Paid At
            </span>
            <span className="text-slate-300 font-mono">
              {paidAt ? (
                formatOperationalDateTime(String(paidAt))
              ) : isPaid ? (
                formatOperationalDateTime(booking.createdAt)
              ) : (
                <span className="text-slate-600">—</span>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Payment Channel
            </span>
            <span className="text-slate-300 capitalize">{String(channel)}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Gateway Provider
            </span>
            <span className="text-slate-300 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-aviation-gold" />
              Razorpay Standard Checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
