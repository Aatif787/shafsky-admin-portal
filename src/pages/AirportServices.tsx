import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchAirportServices,
  fetchRecycledAirportServices,
  updateAirportServicePrice,
  recycleAirportService,
  restoreAirportService,
  purgeAirportService,
  type AirportServiceItem,
} from "../api/airportServices";
import { useAuth } from "../auth/useAuth";
import { formatOperationalDateTime } from "../lib/dateUtils";
import {
  Coins,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Edit3,
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  Trash2,
  RotateCcw,
  Archive,
  Plus,
  ListChecks,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  Eye,
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
  const { role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const canEdit = isSuperAdmin || isAdmin;

  // Tab State
  const [activeTab, setActiveTab] = useState<"active" | "recycle_bin">("active");

  // Data States
  const [services, setServices] = useState<AirportServiceItem[]>([]);
  const [recycledServices, setRecycledServices] = useState<AirportServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecycleLoading, setIsRecycleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recycleError, setRecycleError] = useState<string | null>(null);
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
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState<string>("");
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [bulkFeaturesText, setBulkFeaturesText] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Super Admin Delete Lifecycle Modals State
  const [itemToRecycle, setItemToRecycle] = useState<AirportServiceItem | null>(null);
  const [isRecycling, setIsRecycling] = useState(false);

  const [itemToPurge, setItemToPurge] = useState<AirportServiceItem | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadActiveData = useCallback(async () => {
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

  const loadRecycledData = useCallback(async () => {
    if (!isSuperAdmin) return;
    setIsRecycleLoading(true);
    setRecycleError(null);
    const res = await fetchRecycledAirportServices({ airport: selectedAirport || undefined });
    if (res.error) {
      setRecycleError(res.error);
      setRecycledServices([]);
    } else if (res.data) {
      setRecycledServices(res.data);
    }
    setIsRecycleLoading(false);
  }, [isSuperAdmin, selectedAirport]);

  useEffect(() => {
    loadActiveData();
  }, [loadActiveData]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadRecycledData();
    }
  }, [isSuperAdmin, loadRecycledData]);

  // If user is not super admin, ensure activeTab is always "active"
  useEffect(() => {
    if (!isSuperAdmin && activeTab === "recycle_bin") {
      setActiveTab("active");
    }
  }, [isSuperAdmin, activeTab]);

  const handleRefresh = () => {
    if (activeTab === "active") {
      loadActiveData();
    } else {
      loadRecycledData();
    }
  };

  // Client-side filtering for active services
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

  // Client-side filtering for recycled services
  const filteredRecycledServices = useMemo(() => {
    return recycledServices.filter((item) => {
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
  }, [recycledServices, searchQuery]);

  const showToast = (type: "success" | "error", text: string, duration = 5000) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), duration);
  };

  const handleOpenEdit = (item: AirportServiceItem) => {
    setEditingItem(item);
    setEditPrice(String(item.price));
    setEditNoticeHours(item.min_booking_notice_hours ? String(item.min_booking_notice_hours) : "");
    setEditTerminal(item.terminal || "");
    const initialFeatures = Array.isArray(item.features)
      ? item.features.map((f) => String(f).trim()).filter(Boolean)
      : [];
    setEditFeatures(initialFeatures);
    setBulkFeaturesText(initialFeatures.join("\n"));
    setIsBulkMode(false);
    setNewFeatureText("");
    setEditError(null);
  };

  const handleAddFeature = () => {
    const cleaned = newFeatureText.replace(/^[•\-\*]\s*/, "").trim();
    if (!cleaned) return;
    setEditFeatures((prev) => [...prev, cleaned]);
    setNewFeatureText("");
  };

  const handleUpdateFeature = (index: number, val: string) => {
    setEditFeatures((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveFeature = (index: number) => {
    setEditFeatures((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveFeature = (index: number, direction: "up" | "down") => {
    setEditFeatures((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleToggleBulkMode = () => {
    if (!isBulkMode) {
      setBulkFeaturesText(editFeatures.join("\n"));
      setIsBulkMode(true);
    } else {
      const parsed = bulkFeaturesText
        .split("\n")
        .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
      setEditFeatures(parsed);
      setIsBulkMode(false);
    }
  };

  const handleUppercaseAllFeatures = () => {
    if (isBulkMode) {
      setBulkFeaturesText((prev) => prev.toUpperCase());
    } else {
      setEditFeatures((prev) => prev.map((f) => f.toUpperCase()));
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!canEdit) {
      setEditError("Permission denied: Only Admin and Super Admin can edit services.");
      return;
    }

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

    // Determine final features list
    const finalFeatures: string[] = isBulkMode
      ? bulkFeaturesText
          .split("\n")
          .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean)
      : editFeatures
          .map((item) => item.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean);

    // If user has unadded text in the quick-add input, include it safely
    if (!isBulkMode && newFeatureText.trim()) {
      const pendingText = newFeatureText.replace(/^[•\-\*]\s*/, "").trim();
      if (pendingText && !finalFeatures.includes(pendingText)) {
        finalFeatures.push(pendingText);
      }
    }

    setIsSaving(true);
    setEditError(null);

    const res = await updateAirportServicePrice(editingItem.id, {
      price: numPrice,
      min_booking_notice_hours: numNotice,
      terminal: editTerminal.trim() || undefined,
      features: finalFeatures,
    });

    setIsSaving(false);

    if (res.error) {
      setEditError(res.error);
    } else if (res.data) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingItem.id ? { ...s, ...res.data } : s))
      );
      setEditingItem(null);
      showToast(
        "success",
        `Successfully updated ${editingItem.service_name} at ${editingItem.airport_code} (Price: ₹${numPrice.toLocaleString("en-IN")}, ${finalFeatures.length} inclusions)`
      );
    }
  };

  const handleToggleAvailability = async (item: AirportServiceItem) => {
    if (!canEdit) {
      showToast("error", "Only Admin and Super Admin can change service availability.");
      return;
    }
    const newStatus = !item.is_available;
    const res = await updateAirportServicePrice(item.id, { is_available: newStatus });
    if (res.error) {
      showToast("error", `Failed to toggle status: ${res.error}`);
    } else if (res.data) {
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_available: newStatus } : s))
      );
      showToast(
        "success",
        `${item.service_name} at ${item.airport_code} is now ${newStatus ? "ACTIVE" : "DISABLED"}`
      );
    }
  };

  // Super Admin Action: Move to Recycle Bin (Soft Delete)
  const handleConfirmRecycle = async () => {
    if (!itemToRecycle) return;
    setIsRecycling(true);

    const res = await recycleAirportService(itemToRecycle.id);
    setIsRecycling(false);

    if (res.error) {
      showToast("error", `Failed to delete service: ${res.error}`);
      return;
    }

    // Remove from active list
    setServices((prev) => prev.filter((s) => s.id !== itemToRecycle.id));
    // Add to recycled list if loaded
    setRecycledServices((prev) => [
      {
        ...itemToRecycle,
        deleted_at: new Date().toISOString(),
        deleted_by_role: "SUPER_ADMIN",
        is_available: false,
      },
      ...prev,
    ]);

    showToast(
      "success",
      `Moved "${itemToRecycle.service_name}" at ${itemToRecycle.airport_code} to Recycle Bin.`
    );
    setItemToRecycle(null);
  };

  // Super Admin Action: Restore from Recycle Bin
  const handleRestore = async (item: AirportServiceItem) => {
    setRestoringId(item.id);
    const res = await restoreAirportService(item.id);
    setRestoringId(null);

    if (res.error) {
      showToast("error", `Failed to restore service: ${res.error}`);
      return;
    }

    // Remove from recycle bin
    setRecycledServices((prev) => prev.filter((s) => s.id !== item.id));
    // Add back to active services
    setServices((prev) => [
      {
        ...item,
        deleted_at: null,
        is_available: true,
      },
      ...prev,
    ]);

    showToast(
      "success",
      `Restored "${item.service_name}" at ${item.airport_code}. Service is now active.`
    );
  };

  // Super Admin Action: Permanent Purge
  const handleConfirmPurge = async () => {
    if (!itemToPurge) return;
    setIsPurging(true);

    const res = await purgeAirportService(itemToPurge.id);
    setIsPurging(false);

    if (res.error) {
      showToast("error", `Failed to permanently purge service: ${res.error}`);
      return;
    }

    // Remove from recycle bin
    setRecycledServices((prev) => prev.filter((s) => s.id !== itemToPurge.id));
    showToast(
      "success",
      `Permanently deleted "${itemToPurge.service_name}" at ${itemToPurge.airport_code} from the database.`
    );
    setItemToPurge(null);
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
            onClick={handleRefresh}
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
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "active"
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("recycle_bin");
              loadRecycledData();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "recycle_bin"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Recycle Bin</span>
            {recycledServices.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "recycle_bin"
                    ? "bg-rose-800 text-white"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {recycledServices.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE SERVICES TAB */}
      {/* ========================================================================= */}
      {activeTab === "active" && (
        <>
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
                  onClick={loadActiveData}
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
                            {/* Inclusions Counter Pill */}
                            <div className="mt-1 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-lime-50 text-slate-600 hover:text-lime-800 border border-slate-200 hover:border-lime-300 transition-all cursor-pointer"
                                title={
                                  item.features && item.features.length > 0
                                    ? `Inclusions (${item.features.length}):\n• ${item.features.join("\n• ")}`
                                    : "No inclusions set (Click to configure)"
                                }
                              >
                                <ListChecks className="h-3 w-3 text-lime-600" />
                                <span>{item.features?.length || 0} Inclusions</span>
                              </button>
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
                            title={canEdit ? "Click to toggle active status" : "Current active status"}
                            disabled={!canEdit}
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
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Price & Inclusions (Admin & Super Admin) */}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              title={canEdit ? "Edit price, terminal & inclusions" : "View service details & inclusions"}
                            >
                              {canEdit ? (
                                <>
                                  <Edit3 className="h-3 w-3 text-slate-500" />
                                  <span>Edit</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 text-slate-500" />
                                  <span>View</span>
                                </>
                              )}
                            </button>

                            {/* Delete / Move to Recycle Bin (Super Admin Only) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => setItemToRecycle(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                                title="Move to Recycle Bin (Super Admin only)"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* RECYCLE BIN TAB (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeTab === "recycle_bin" && isSuperAdmin && (
        <div className="space-y-4">
          {/* Recycle Bin Explainer Header */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
            <Archive className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-950 text-sm">Services Recycle Bin</h3>
              <p className="mt-0.5 text-rose-800">
                Services in the Recycle Bin are completely removed from customer booking flows and airport availability.
                As a <strong>Super Admin</strong>, you can either restore them back to the active catalog or permanently purge them from the database.
              </p>
            </div>
          </div>

          {/* Search bar inside recycle bin */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search deleted packages by name, airport or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {filteredRecycledServices.length} deleted {filteredRecycledServices.length === 1 ? "service" : "services"}
            </span>
          </div>

          {/* Recycle Bin Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {isRecycleLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-rose-600" />
                <p className="text-xs font-medium text-slate-500">Loading recycled services...</p>
              </div>
            ) : recycleError ? (
              <div className="py-12 px-4 text-center">
                <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-rose-800">{recycleError}</p>
                <button
                  onClick={loadRecycledData}
                  className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  Retry
                </button>
              </div>
            ) : filteredRecycledServices.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Archive className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Recycle Bin is empty.</p>
                <p className="text-xs text-slate-500 mt-1">
                  No airport services have been moved to the recycle bin.
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
                      <th className="py-3 px-4">Moved To Bin</th>
                      <th className="py-3 px-4">Deleted By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecycledServices.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-rose-50/20 transition-colors group text-slate-700"
                      >
                        {/* Airport Hub */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                              {item.airport_code}
                            </span>
                            <span className="text-slate-500 truncate max-w-[130px]">
                              {item.city}
                            </span>
                          </div>
                        </td>

                        {/* Service Package */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-semibold text-slate-900 line-through opacity-80">
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
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {item.journey_type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.flight_type === "ALL" ? "Dom + Int'l" : item.flight_type}
                            </span>
                          </div>
                        </td>

                        {/* Deletion Date */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="font-medium text-[11px]">
                            {formatOperationalDateTime(item.deleted_at)}
                          </div>
                        </td>

                        {/* Deleted By */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-medium text-[11px]">
                              {item.deleted_by_email || "Super Admin"}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600">
                              {item.deleted_by_role || "SUPER_ADMIN"}
                            </span>
                          </div>
                        </td>

                        {/* Actions: Restore & Permanent Purge */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Restore Button */}
                            <button
                              type="button"
                              onClick={() => handleRestore(item)}
                              disabled={restoringId === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold shadow-xs hover:bg-lime-50 hover:text-lime-700 hover:border-lime-200 transition-colors disabled:opacity-50"
                              title="Restore service to active catalog"
                            >
                              <RotateCcw
                                className={`h-3 w-3 text-slate-500 ${
                                  restoringId === item.id ? "animate-spin text-lime-600" : ""
                                }`}
                              />
                              <span>Restore</span>
                            </button>

                            {/* Permanent Purge Button */}
                            <button
                              type="button"
                              onClick={() => setItemToPurge(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold shadow-xs hover:bg-rose-100 hover:text-rose-800 transition-colors"
                              title="Permanently remove from database"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Purge</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: MOVE TO RECYCLE BIN CONFIRMATION */}
      {/* ========================================================================= */}
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
                onClick={() => setItemToRecycle(null)}
                disabled={isRecycling}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRecycle}
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

      {/* ========================================================================= */}
      {/* MODAL 2: PERMANENT PURGE CONFIRMATION */}
      {/* ========================================================================= */}
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
                onClick={() => setItemToPurge(null)}
                disabled={isPurging}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
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

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT SERVICE & INCLUSIONS (ADMIN & SUPER ADMIN) */}
      {/* ========================================================================= */}
      {editingItem && (
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
                onClick={() => setEditingItem(null)}
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

              {/* Grid: Price, Terminal, Cutoff Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    onClick={() => setEditingItem(null)}
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
      )}
    </div>
  );
};
