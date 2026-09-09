import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchAirportServices,
  updateAirportServicePrice,
  type AirportServiceItem,
} from "../api/airportServices";
import {
  Coins,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

const SUPPORTED_AIRPORTS = [
  { code: "", label: "All Airports (20 Hubs)" },
  { code: "DEL", label: "DEL - Indira Gandhi Int'l, Delhi" },
  { code: "BOM", label: "BOM - Chhatrapati Shivaji Maharaj, Mumbai" },
  { code: "BLR", label: "BLR - Kempegowda Int'l, Bengaluru" },
  { code: "LKO", label: "LKO - Chaudhary Charan Singh, Lucknow" },
  { code: "HYD", label: "HYD - Rajiv Gandhi Int'l, Hyderabad" },
  { code: "CCU", label: "CCU - Netaji Subhash Chandra Bose, Kolkata" },
  { code: "MAA", label: "MAA - Chennai Int'l, Chennai" },
  { code: "AMD", label: "AMD - Sardar Vallabhbhai Patel, Ahmedabad" },
  { code: "GOI", label: "GOI - Dabolim Airport, Goa" },
  { code: "GOX", label: "GOX - Manohar Int'l, Mopa Goa" },
  { code: "COK", label: "COK - Cochin Int'l, Kochi" },
  { code: "ATQ", label: "ATQ - Sri Guru Ram Dass Jee, Amritsar" },
  { code: "JAI", label: "JAI - Jaipur Int'l, Jaipur" },
  { code: "IXC", label: "IXC - Shaheed Bhagat Singh, Chandigarh" },
  { code: "BBI", label: "BBI - Biju Patnaik Int'l, Bhubaneswar" },
  { code: "TRV", label: "TRV - Thiruvananthapuram Int'l" },
  { code: "VTZ", label: "VTZ - Visakhapatnam Int'l" },
  { code: "IXE", label: "IXE - Mangaluru Int'l" },
  { code: "IXR", label: "IXR - Birsa Munda, Ranchi" },
  { code: "GAU", label: "GAU - Lokpriya Gopinath Bordoloi, Guwahati" },
];

export const AirportServices: React.FC = () => {
  const [services, setServices] = useState<AirportServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter States
  const [selectedAirport, setSelectedAirport] = useState<string>("");
  const [selectedJourney, setSelectedJourney] = useState<string>("ALL");
  const [selectedFlightType, setSelectedFlightType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Editing State
  const [editingItem, setEditingItem] = useState<AirportServiceItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editNoticeHours, setEditNoticeHours] = useState<string>("");
  const [editTerminal, setEditTerminal] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await fetchAirportServices({ airport: selectedAirport || undefined });
    if (res.error) {
      setError(res.error);
      setServices([]);
    } else if (res.data) {
      setServices(res.data);
    }
    setIsLoading(false);
  }, [selectedAirport]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filtering
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      if (selectedJourney !== "ALL" && item.journey_type !== selectedJourney) return false;
      if (selectedFlightType !== "ALL" && item.flight_type !== selectedFlightType && item.flight_type !== "ALL") {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.service_name.toLowerCase().includes(q);
        const matchesAirport = item.airport_code.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        const matchesSlug = item.service_slug.toLowerCase().includes(q);
        if (!matchesName && !matchesAirport && !matchesCity && !matchesSlug) return false;
      }
      return true;
    });
  }, [services, selectedJourney, selectedFlightType, searchQuery]);

  const handleOpenEdit = (item: AirportServiceItem) => {
    setEditingItem(item);
    setEditPrice(String(item.price));
    setEditNoticeHours(item.min_booking_notice_hours ? String(item.min_booking_notice_hours) : "");
    setEditTerminal(item.terminal || "");
    setEditError(null);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setEditError("Please enter a valid positive price.");
      return;
    }

    const numNotice = editNoticeHours.trim() ? parseInt(editNoticeHours, 10) : undefined;
    if (numNotice !== undefined && (isNaN(numNotice) || numNotice < 0)) {
      setEditError("Minimum notice hours must be 0 or higher.");
      return;
    }

    setIsSaving(true);
    setEditError(null);

    const res = await updateAirportServicePrice(editingItem.id, {
      price: numPrice,
      min_booking_notice_hours: numNotice,
      terminal: editTerminal.trim() || undefined,
    });

    setIsSaving(false);

    if (res.error) {
      setEditError(res.error);
    } else if (res.data) {
      // Success update in local state
      setServices((prev) =>
        prev.map((s) => (s.id === editingItem.id ? { ...s, ...res.data } : s))
      );
      setEditingItem(null);
      setToastMessage({
        type: "success",
        text: `Successfully updated ${editingItem.service_name} at ${editingItem.airport_code} to ₹${numPrice.toLocaleString("en-IN")}`,
      });
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleToggleAvailability = async (item: AirportServiceItem) => {
    const newStatus = !item.is_available;
    const res = await updateAirportServicePrice(item.id, { is_available: newStatus });
    if (res.error) {
      setToastMessage({ type: "error", text: `Failed to toggle status: ${res.error}` });
      setTimeout(() => setToastMessage(null), 5000);
    } else if (res.data) {
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_available: newStatus } : s))
      );
      setToastMessage({
        type: "success",
        text: `${item.service_name} at ${item.airport_code} is now ${newStatus ? "ACTIVE" : "DISABLED"}`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs shadow-lg animate-in slide-in-from-bottom-5 font-medium ${
            toastMessage.type === "success"
              ? "bg-lime-50 border-lime-200 text-lime-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-lime-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

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
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Airport Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Airport Hub
            </label>
            <select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
            >
              {SUPPORTED_AIRPORTS.map((apt) => (
                <option key={apt.code} value={apt.code}>
                  {apt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Journey Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Journey Type
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {["ALL", "DEPARTURE", "ARRIVAL", "TRANSIT"].map((jt) => (
                <button
                  key={jt}
                  type="button"
                  onClick={() => setSelectedJourney(jt)}
                  className={`py-1 rounded-md text-center font-semibold transition-all ${
                    selectedJourney === jt
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {jt === "ALL" ? "All" : jt.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Flight Type Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Flight Scope
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {["ALL", "DOMESTIC", "INTERNATIONAL"].map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSelectedFlightType(ft)}
                  className={`py-1 rounded-md text-center font-semibold transition-all ${
                    selectedFlightType === ft
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {ft === "ALL" ? "All" : ft === "DOMESTIC" ? "Dom" : "Int'l"}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Packages
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Platinum, Elite, LKO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
              />
            </div>
          </div>
        </div>

        {/* Active Stats bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredServices.length}</strong> package mappings
            {selectedAirport ? ` for ${selectedAirport}` : " across all hubs"}
          </span>
          <span className="text-[11px] text-slate-400">
            GST Inclusive • Per Passenger Rates
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-lime-600" />
            <p className="text-xs font-medium text-slate-500">Loading authoritative pricing catalog...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <SlidersHorizontal className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No airport service mappings match your filter.</p>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting "All Airports" or adjusting the Journey filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Airport Hub</th>
                  <th className="py-3 px-4">Service Package</th>
                  <th className="py-3 px-4">Route Type</th>
                  <th className="py-3 px-4">Terminal</th>
                  <th className="py-3 px-4">Notice Cutoff</th>
                  <th className="py-3 px-4 text-right">Active Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-lime-50/20 transition-colors group text-slate-700"
                  >
                    {/* Airport Hub */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {item.airport_code}
                        </span>
                        <span className="text-slate-500 truncate max-w-[140px]" title={item.city}>
                          {item.city}
                        </span>
                      </div>
                    </td>

                    {/* Service Package */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-lime-700 transition-colors">
                          {item.service_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          slug: {item.service_slug}
                        </div>
                      </div>
                    </td>

                    {/* Route Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.journey_type === "DEPARTURE"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : item.journey_type === "ARRIVAL"
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {item.journey_type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.flight_type === "ALL" ? "Dom + Int'l" : item.flight_type}
                        </span>
                      </div>
                    </td>

                    {/* Terminal */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-mono text-[11px] font-medium">{item.terminal || "All"}</span>
                    </td>

                    {/* Notice Cutoff */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {item.min_booking_notice_hours ? `${item.min_booking_notice_hours} hrs` : "Standard"}
                    </td>

                    {/* Active Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{item.currency || "INR"}</div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border ${
                          item.is_available
                            ? "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                        title="Click to toggle active status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.is_available ? "bg-lime-600" : "bg-rose-500"
                          }`}
                        />
                        {item.is_available ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Edit3 className="h-3 w-3 text-slate-500" />
                        <span>Edit Price</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Price Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <div>
                <div className="text-[10px] font-semibold text-lime-700 uppercase tracking-wider">
                  Update Service Pricing
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {editingItem.service_name}
                </h2>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePrice} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Readonly Context Badges */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Airport Hub</span>
                  <span className="font-semibold text-slate-900">
                    {editingItem.airport_code} ({editingItem.city})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Route Scope</span>
                  <span className="font-semibold text-slate-900">
                    {editingItem.journey_type} • {editingItem.flight_type}
                  </span>
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package Rate (₹ INR) <span className="text-rose-500">*</span>
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
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-xs"
                    placeholder="e.g. 2420.00"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium">
                  <span>Current Price: ₹{editingItem.price.toLocaleString("en-IN")}</span>
                  {parseFloat(editPrice) !== editingItem.price && !isNaN(parseFloat(editPrice)) && (
                    <span className="text-lime-700 font-bold flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" /> New: ₹{parseFloat(editPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal Specification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Terminal Applicability
                </label>
                <input
                  type="text"
                  value={editTerminal}
                  onChange={(e) => setEditTerminal(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                  placeholder="e.g. Terminal 3, T1, or All"
                />
              </div>

              {/* Booking Cutoff Notice Hours */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Booking Notice (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="72"
                  value={editNoticeHours}
                  onChange={(e) => setEditNoticeHours(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono shadow-xs focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                  placeholder="e.g. 6 (or 24 for international)"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Lead time required before flight scheduled departure/arrival.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Authoritative Price</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
