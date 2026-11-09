import React from "react";
import { Trash2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { AirportServiceItem } from "../../api/airportServices";

export interface AirportServiceDeleteModalsProps {
  itemToRecycle: AirportServiceItem | null;
  isRecycling: boolean;
  onCancelRecycle: () => void;
  onConfirmRecycle: () => void;
  itemToPurge: AirportServiceItem | null;
  isPurging: boolean;
  onCancelPurge: () => void;
  onConfirmPurge: () => void;
}

export const AirportServiceDeleteModals: React.FC<AirportServiceDeleteModalsProps> = ({
  itemToRecycle,
  isRecycling,
  onCancelRecycle,
  onConfirmRecycle,
  itemToPurge,
  isPurging,
  onCancelPurge,
  onConfirmPurge,
}) => {
  return (
    <>
      {/* MODAL 1: MOVE TO RECYCLE BIN CONFIRMATION */}
      {itemToRecycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Move Service to Recycle Bin?
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    This will safely deactivate and remove{" "}
                    <strong className="text-slate-900 font-semibold">{itemToRecycle.service_name}</strong> at{" "}
                    <strong className="text-slate-900 font-semibold">{itemToRecycle.airport_code}</strong> (
                    {itemToRecycle.journey_type} • {itemToRecycle.flight_type}) from all customer booking flows.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  The service will be placed in the <strong>Recycle Bin</strong> and can be restored at any time by a Super Admin.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancelRecycle}
                disabled={isRecycling}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmRecycle}
                disabled={isRecycling}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isRecycling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Moving to Bin...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Move to Recycle Bin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PERMANENT PURGE CONFIRMATION */}
      {itemToPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-rose-300 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">
                    Permanently Delete Service?
                  </h3>
                  <p className="mt-1 text-xs text-rose-900/80 leading-relaxed">
                    This action is <span className="font-bold underline text-rose-900">irreversible</span>. The package mapping{" "}
                    <strong className="text-slate-900 font-semibold">{itemToPurge.service_name}</strong> at{" "}
                    <strong className="text-slate-900 font-semibold">{itemToPurge.airport_code}</strong> will be permanently wiped from the database.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-rose-900">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Warning: Data cannot be recovered</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Existing confirmed bookings will preserve historical snapshots, but this package mapping will be completely removed from the catalog.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancelPurge}
                disabled={isPurging}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmPurge}
                disabled={isPurging}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Purging from Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

