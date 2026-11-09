import React from "react";
import {
  X,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ListChecks,
  Sparkles,
  Info,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ShieldCheck,
  RefreshCw,
  Check,
} from "lucide-react";
import { AirportServiceItem } from "../../api/airportServices";

export interface AirportServiceEditModalProps {
  editingItem: AirportServiceItem | null;
  canEdit: boolean;
  onClose: () => void;
  handleSavePrice: (e: React.FormEvent) => void;
  editError: string | null;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editIsAvailable: boolean;
  setEditIsAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  editTerminal: string;
  setEditTerminal: (val: string) => void;
  editNoticeHours: string;
  setEditNoticeHours: (val: string) => void;
  isBulkMode: boolean;
  bulkFeaturesText: string;
  setBulkFeaturesText: (val: string) => void;
  editFeatures: string[];
  handleUppercaseAllFeatures: () => void;
  handleToggleBulkMode: () => void;
  handleUpdateFeature: (index: number, val: string) => void;
  handleMoveFeature: (index: number, direction: "up" | "down") => void;
  handleRemoveFeature: (index: number) => void;
  newFeatureText: string;
  setNewFeatureText: (val: string) => void;
  handleAddFeature: () => void;
  isSaving: boolean;
}

export const AirportServiceEditModal: React.FC<AirportServiceEditModalProps> = ({
  editingItem,
  canEdit,
  onClose,
  handleSavePrice,
  editError,
  editPrice,
  setEditPrice,
  editIsAvailable,
  setEditIsAvailable,
  editTerminal,
  setEditTerminal,
  editNoticeHours,
  setEditNoticeHours,
  isBulkMode,
  bulkFeaturesText,
  setBulkFeaturesText,
  editFeatures,
  handleUppercaseAllFeatures,
  handleToggleBulkMode,
  handleUpdateFeature,
  handleMoveFeature,
  handleRemoveFeature,
  newFeatureText,
  setNewFeatureText,
  handleAddFeature,
  isSaving,
}) => {
  if (!editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-lime-700 bg-lime-100/70 border border-lime-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {canEdit ? "Edit Service & Inclusions" : "Service Overview (Read Only)"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {editingItem.airport_code} • {editingItem.journey_type}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {editingItem.service_name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSavePrice} className="flex-1 overflow-y-auto p-6 space-y-5">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{editError}</span>
            </div>
          )}

          {!canEdit && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Read-only mode. Only <strong>Admin</strong> and <strong>Super Admin</strong> can modify pricing, terminals, and service inclusions.
              </span>
            </div>
          )}

          {/* Readonly Context Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Airport Hub</span>
              <span className="font-semibold text-slate-900">
                {editingItem.airport_code}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">{editingItem.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Journey Type</span>
              <span className="font-semibold text-slate-900">
                {editingItem.journey_type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Flight Scope</span>
              <span className="font-semibold text-slate-900">
                {editingItem.flight_type === "ALL" ? "Dom + Int'l" : editingItem.flight_type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Package Slug</span>
              <span className="font-mono text-[11px] text-slate-700 block truncate">
                {editingItem.service_slug}
              </span>
            </div>
          </div>

          {/* Grid: Price, Status, Terminal, Cutoff Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Price Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rate (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  disabled={!canEdit}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs disabled:bg-slate-50"
                  placeholder="e.g. 2420.00"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>Base: ₹{editingItem.price.toLocaleString("en-IN")}</span>
                {parseFloat(editPrice) !== editingItem.price && !isNaN(parseFloat(editPrice)) && (
                  <span className="text-lime-700 font-bold flex items-center gap-0.5">
                    <ArrowRight className="h-2.5 w-2.5" /> ₹{parseFloat(editPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Service Status Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Availability Status
              </label>
              <button
                type="button"
                onClick={() => setEditIsAvailable((prev) => !prev)}
                disabled={!canEdit}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  editIsAvailable
                    ? "bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100"
                    : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100"
                } disabled:opacity-60 disabled:cursor-not-allowed shadow-xs`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      editIsAvailable ? "bg-lime-600" : "bg-rose-500"
                    }`}
                  />
                  {editIsAvailable ? "Active" : "Disabled"}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {editIsAvailable ? "ONLINE" : "OFFLINE"}
                </span>
              </button>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {editIsAvailable
                  ? "Available for booking"
                  : "Hidden from customer booking"}
              </span>
            </div>

            {/* Terminal Specification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Terminal
              </label>
              <input
                type="text"
                value={editTerminal}
                onChange={(e) => setEditTerminal(e.target.value)}
                disabled={!canEdit}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 disabled:bg-slate-50"
                placeholder="e.g. Terminal 3, T1, or All"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Applicable terminal(s)
              </span>
            </div>

            {/* Booking Notice Cutoff */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notice Cutoff (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="72"
                value={editNoticeHours}
                onChange={(e) => setEditNoticeHours(e.target.value)}
                disabled={!canEdit}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 disabled:bg-slate-50"
                placeholder="e.g. 6 or 24"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Advance lead time before flight
              </span>
            </div>
          </div>

          {/* Inclusions & Features Section */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-lime-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Service Inclusions & Deliverables
                </span>
                <span className="px-2 py-0.5 rounded-full bg-lime-50 border border-lime-200 text-[10px] font-bold text-lime-800">
                  {isBulkMode
                    ? `${bulkFeaturesText.split("\n").filter((l) => l.trim()).length} Items`
                    : `${editFeatures.length} Items`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleUppercaseAllFeatures}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                    title="Convert all inclusions to standard uppercase operational format"
                  >
                    <Sparkles className="h-3 w-3 text-slate-500" />
                    <span>UPPERCASE ALL</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleBulkMode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-white transition-colors"
                >
                  {isBulkMode ? "Switch to List View" : "Bulk Edit / Paste"}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              These bullets are shown to guests in the booking catalog, invoices, and WhatsApp confirmations.
            </p>

            {/* Bulk Multiline Mode */}
            {isBulkMode ? (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-600 bg-sky-50 border border-sky-200 p-2.5 rounded-xl flex items-start gap-2">
                  <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    Enter or paste each inclusion on its own line. Any bullets (•, -, *) and extra spaces will be automatically cleaned when saved.
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={bulkFeaturesText}
                  onChange={(e) => setBulkFeaturesText(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs disabled:bg-slate-50"
                  placeholder={`WELCOME GUEST FROM NEAR THE BELT AREA.\nDEDICATED STAFF WITH PLACARD.\nPORTER SERVICE WITH DEDICATED STAFF AT ARRIVALS.\nASSIST IN BAGGAGE BELT AREA.`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>{bulkFeaturesText.split("\n").filter((l) => l.trim()).length} lines detected</span>
                  <button
                    type="button"
                    onClick={handleToggleBulkMode}
                    className="text-lime-700 hover:text-lime-800 font-semibold underline"
                  >
                    Done pasting? Switch back to List View
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive List Mode */
              <div className="space-y-2">
                {editFeatures.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-xs">
                    <ListChecks className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="font-semibold text-slate-700">No Inclusions Added Yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Type an inclusion below and click "+ Add Item" or switch to "Bulk Edit / Paste".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {editFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors group"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                          disabled={!canEdit}
                          className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 disabled:bg-transparent disabled:border-transparent"
                          placeholder="Inclusion item text..."
                        />
                        {canEdit && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveFeature(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveFeature(idx, "down")}
                              disabled={idx === editFeatures.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Inclusion"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Bar */}
                {canEdit && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs"
                      placeholder="Type an inclusion & press Enter to add..."
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!newFeatureText.trim()}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pinned Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-lime-600 shrink-0" />
              <span>
                {canEdit
                  ? "Admin / Super Admin Authorized"
                  : "Read-Only View"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Service & Inclusions</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

