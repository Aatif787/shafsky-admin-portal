import React from "react";
import { Coins, ShieldCheck, RefreshCw, Archive } from "lucide-react";

export interface AirportServicesHeaderProps {
  isSuperAdmin: boolean;
  activeTab: "active" | "recycle_bin";
  setActiveTab: (tab: "active" | "recycle_bin") => void;
  recycledCount: number;
  isLoading: boolean;
  isRecycleLoading: boolean;
  onRefresh: () => void;
}

export const AirportServicesHeader: React.FC<AirportServicesHeaderProps> = ({
  isSuperAdmin,
  activeTab,
  setActiveTab,
  recycledCount,
  isLoading,
  isRecycleLoading,
  onRefresh,
}) => {
  return (
    <>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-lime-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Airport Services & Pricing
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Active service rates per airport and route. Changes update instantly across website booking and WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-medium shadow-xs">
            <ShieldCheck className="h-4 w-4 text-lime-600" />
            <span>Live Database</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading || isRecycleLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${
                isLoading || isRecycleLoading ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Super Admin Tab Navigation */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "active"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <span>Active Services</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recycle_bin")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "recycle_bin"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Recycle Bin</span>
            {recycledCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "recycle_bin"
                    ? "bg-rose-800 text-white"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {recycledCount}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
};

