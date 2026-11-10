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
import { isAdminRole } from "../auth/roles";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { AirportServicesHeader } from "./airport-services/AirportServicesHeader";
import { AirportServicesFilters } from "./airport-services/AirportServicesFilters";
import { AirportServicesActiveTable } from "./airport-services/AirportServicesActiveTable";
import { AirportServicesRecycleTable } from "./airport-services/AirportServicesRecycleTable";
import { AirportServiceDeleteModals } from "./airport-services/AirportServiceDeleteModals";
import { AirportServiceEditModal } from "./airport-services/AirportServiceEditModal";

export const AirportServices: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const canEdit = isSuperAdmin || isAdmin || isAdminRole(role);

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
  const [editIsAvailable, setEditIsAvailable] = useState<boolean>(true);
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
    setEditIsAvailable(item.is_available);
    const rawFeatures = (Array.isArray(item.features) && item.features.length > 0)
      ? item.features
      : (Array.isArray(item.inclusions) ? item.inclusions : item.features);
    const initialFeatures = Array.isArray(rawFeatures)
      ? rawFeatures.map((f) => String(f).trim()).filter(Boolean)
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
      const uppercased = bulkFeaturesText
        .split("\n")
        .map((line) => line.toUpperCase())
        .join("\n");
      setBulkFeaturesText(uppercased);
    } else {
      setEditFeatures((prev) => prev.map((f) => f.toUpperCase()));
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditError("Please enter a valid price greater than 0");
      return;
    }

    const parsedNoticeHours = editNoticeHours.trim() ? parseInt(editNoticeHours, 10) : undefined;
    if (parsedNoticeHours !== undefined && (isNaN(parsedNoticeHours) || parsedNoticeHours < 0)) {
      setEditError("Please enter a valid non-negative notice cutoff in hours");
      return;
    }

    let finalFeatures: string[];
    if (isBulkMode) {
      finalFeatures = bulkFeaturesText
        .split("\n")
        .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
    } else {
      finalFeatures = editFeatures.map((f) => f.trim()).filter(Boolean);
    }

    setIsSaving(true);
    setEditError(null);

    const res = await updateAirportServicePrice(editingItem.id, {
      price: parsedPrice,
      is_available: editIsAvailable,
      min_booking_notice_hours: parsedNoticeHours,
      terminal: editTerminal.trim() || undefined,
      features: finalFeatures,
    });

    setIsSaving(false);

    if (res.error) {
      setEditError(res.error);
    } else if (res.data) {
      setServices((prev) =>
        prev.map((item) => (item.id === editingItem.id ? res.data! : item))
      );
      showToast("success", `Updated ${editingItem.service_name} (${editingItem.airport_code}) successfully.`);
      setEditingItem(null);
    }
  };

  const handleToggleAvailability = async (item: AirportServiceItem) => {
    if (!canEdit) return;
    const newStatus = !item.is_available;
    setServices((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, is_available: newStatus } : s))
    );

    const res = await updateAirportServicePrice(item.id, { is_available: newStatus });
    if (res.error) {
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_available: item.is_available } : s))
      );
      showToast("error", `Failed to update status: ${res.error}`);
    } else {
      showToast("success", `${item.service_name} is now ${newStatus ? "Active" : "Disabled"}`);
    }
  };

  const handleConfirmRecycle = async () => {
    if (!itemToRecycle || !isSuperAdmin) return;
    setIsRecycling(true);

    const res = await recycleAirportService(itemToRecycle.id);
    setIsRecycling(false);

    if (res.error) {
      showToast("error", `Failed to delete service: ${res.error}`);
      return;
    }

    setServices((prev) => prev.filter((s) => s.id !== itemToRecycle.id));
    setRecycledServices((prev) => [
      {
        ...itemToRecycle,
        deleted_at: new Date().toISOString(),
        deleted_by_role: "SUPER_ADMIN",
        is_available: false,
      },
      ...prev,
    ]);
    showToast("success", `Moved "${itemToRecycle.service_name}" at ${itemToRecycle.airport_code} to Recycle Bin.`);
    setItemToRecycle(null);
  };

  const handleRestore = async (item: AirportServiceItem) => {
    if (!isSuperAdmin) return;
    setRestoringId(item.id);

    const res = await restoreAirportService(item.id);
    setRestoringId(null);

    if (res.error) {
      showToast("error", `Failed to restore service: ${res.error}`);
      return;
    }

    setRecycledServices((prev) => prev.filter((s) => s.id !== item.id));
    setServices((prev) => [
      {
        ...item,
        deleted_at: null,
        is_available: true,
      },
      ...prev,
    ]);
    showToast("success", `Restored "${item.service_name}" at ${item.airport_code}. Service is now active.`);
  };

  const handleConfirmPurge = async () => {
    if (!itemToPurge || !isSuperAdmin) return;
    setIsPurging(true);

    const res = await purgeAirportService(itemToPurge.id);
    setIsPurging(false);

    if (res.error) {
      showToast("error", `Failed to permanently purge service: ${res.error}`);
    } else {
      setRecycledServices((prev) => prev.filter((s) => s.id !== itemToPurge.id));
      showToast("success", `Permanently purged ${itemToPurge.service_name} from database.`);
      setItemToPurge(null);
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

      {/* Header Banner & Tab Switcher */}
      <AirportServicesHeader
        isSuperAdmin={isSuperAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recycledCount={recycledServices.length}
        isLoading={isLoading}
        isRecycleLoading={isRecycleLoading}
        onRefresh={handleRefresh}
      />

      {/* ACTIVE SERVICES TAB */}
      {activeTab === "active" && (
        <>
          <AirportServicesFilters
            selectedAirport={selectedAirport}
            setSelectedAirport={setSelectedAirport}
            selectedJourney={selectedJourney}
            setSelectedJourney={setSelectedJourney}
            selectedFlightType={selectedFlightType}
            setSelectedFlightType={setSelectedFlightType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCount={filteredServices.length}
            totalCount={services.length}
          />

          <AirportServicesActiveTable
            isLoading={isLoading}
            error={error}
            onRetry={loadActiveData}
            filteredServices={filteredServices}
            canEdit={canEdit}
            isSuperAdmin={isSuperAdmin}
            onOpenEdit={handleOpenEdit}
            onToggleAvailability={handleToggleAvailability}
            onSetItemToRecycle={setItemToRecycle}
          />
        </>
      )}

      {/* RECYCLE BIN TAB (SUPER ADMIN ONLY) */}
      {activeTab === "recycle_bin" && isSuperAdmin && (
        <AirportServicesRecycleTable
          isRecycleLoading={isRecycleLoading}
          recycleError={recycleError}
          onRetry={loadRecycledData}
          filteredRecycledServices={filteredRecycledServices}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          restoringId={restoringId}
          onRestore={handleRestore}
          onPurge={setItemToPurge}
        />
      )}

      {/* Lifecycle Delete Modals */}
      <AirportServiceDeleteModals
        itemToRecycle={itemToRecycle}
        isRecycling={isRecycling}
        onCancelRecycle={() => setItemToRecycle(null)}
        onConfirmRecycle={handleConfirmRecycle}
        itemToPurge={itemToPurge}
        isPurging={isPurging}
        onCancelPurge={() => setItemToPurge(null)}
        onConfirmPurge={handleConfirmPurge}
      />

      {/* Edit Service Modal */}
      <AirportServiceEditModal
        editingItem={editingItem}
        canEdit={canEdit}
        onClose={() => setEditingItem(null)}
        handleSavePrice={handleSavePrice}
        editError={editError}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editIsAvailable={editIsAvailable}
        setEditIsAvailable={setEditIsAvailable}
        editTerminal={editTerminal}
        setEditTerminal={setEditTerminal}
        editNoticeHours={editNoticeHours}
        setEditNoticeHours={setEditNoticeHours}
        isBulkMode={isBulkMode}
        bulkFeaturesText={bulkFeaturesText}
        setBulkFeaturesText={setBulkFeaturesText}
        editFeatures={editFeatures}
        handleUppercaseAllFeatures={handleUppercaseAllFeatures}
        handleToggleBulkMode={handleToggleBulkMode}
        handleUpdateFeature={handleUpdateFeature}
        handleMoveFeature={handleMoveFeature}
        handleRemoveFeature={handleRemoveFeature}
        newFeatureText={newFeatureText}
        setNewFeatureText={setNewFeatureText}
        handleAddFeature={handleAddFeature}
        isSaving={isSaving}
      />
    </div>
  );
};
