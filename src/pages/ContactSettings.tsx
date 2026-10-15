import React, { useState, useEffect, useCallback } from "react";
import {
  PhoneCall,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  Car,
  Hotel as HotelIcon,
  Plane,
  Ticket,
  Headphones,
  Info,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  fetchAdminContactSettings,
  updateAdminContactSettings,
  type ServiceKey,
} from "../api/contactSettings";

interface CanonicalServiceMeta {
  key: ServiceKey;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CANONICAL_SERVICES: CanonicalServiceMeta[] = [
  {
    key: "meet_greet_lounge",
    name: "Meet & Greet & Lounge",
    description: "Airport tarmac reception, VIP lounge access, and expedited airside assistance.",
    icon: Sparkles,
  },
  {
    key: "transport",
    name: "Transport",
    description: "Chauffeured tarmac transfers, executive sedans, and luxury airport passenger transport.",
    icon: Car,
  },
  {
    key: "hotel",
    name: "Hotel",
    description: "Airport transit hotel suites and luxury partner hospitality concierge.",
    icon: HotelIcon,
  },
  {
    key: "private_charter",
    name: "Private Charter",
    description: "Dedicated private charter desk for executive jets, air ambulances, and helicopters.",
    icon: Plane,
  },
  {
    key: "ticketing",
    name: "Ticketing",
    description: "Direct flight re-issuance, priority passenger rebooking, and airline ticketing.",
    icon: Ticket,
  },
  {
    key: "contact",
    name: "Contact",
    description: "General aviation desk, direct passenger support, and central contact page.",
    icon: Headphones,
  },
];

const POPULAR_COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+1", label: "+1 (USA/Canada)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+974", label: "+974 (Qatar)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+61", label: "+61 (Australia)" },
];

interface LocalSlotState {
  slot_index: number;
  country_code: string;
  phone_number: string;
  is_active: boolean;
}

interface LocalServiceState {
  service_key: ServiceKey;
  service_name: string;
  slots: [LocalSlotState, LocalSlotState];
}

export const ContactSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Draft form state for the 6 services
  const [formState, setFormState] = useState<Record<ServiceKey, LocalServiceState>>(() => {
    const initial: Partial<Record<ServiceKey, LocalServiceState>> = {};
    for (const s of CANONICAL_SERVICES) {
      initial[s.key] = {
        service_key: s.key,
        service_name: s.name,
        slots: [
          { slot_index: 1, country_code: "+91", phone_number: "", is_active: true },
          { slot_index: 2, country_code: "+91", phone_number: "", is_active: false },
        ],
      };
    }
    return initial as Record<ServiceKey, LocalServiceState>;
  });

  // Track original remote values to detect dirty state
  const [savedBaseline, setSavedBaseline] = useState<string>("");

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    setSuccessNotice(null);

    const res = await fetchAdminContactSettings();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      const nextState: Partial<Record<ServiceKey, LocalServiceState>> = {};
      for (const item of res.data) {
        const slot1 = item.slots.find((s) => s.slot_index === 1);
        const slot2 = item.slots.find((s) => s.slot_index === 2);

        nextState[item.service_key] = {
          service_key: item.service_key,
          service_name: item.service_name,
          slots: [
            {
              slot_index: 1,
              country_code: slot1?.country_code || "+91",
              phone_number: slot1?.phone_number || "",
              is_active: slot1?.is_active ?? true,
            },
            {
              slot_index: 2,
              country_code: slot2?.country_code || "+91",
              phone_number: slot2?.phone_number || "",
              is_active: slot2?.is_active ?? false,
            },
          ],
        };
      }

      // Merge with default canonical structure
      setFormState((prev) => {
        const merged = { ...prev, ...nextState };
        setSavedBaseline(JSON.stringify(merged));
        return merged;
      });
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDirty = savedBaseline ? JSON.stringify(formState) !== savedBaseline : false;

  const handleSlotChange = (
    serviceKey: ServiceKey,
    slotIdx: 0 | 1,
    field: keyof LocalSlotState,
    value: any
  ) => {
    setValidationError(null);
    setFormState((prev) => {
      const current = prev[serviceKey];
      if (!current) return prev;
      const nextSlots: [LocalSlotState, LocalSlotState] = [
        { ...current.slots[0] },
        { ...current.slots[1] },
      ];
      nextSlots[slotIdx] = {
        ...nextSlots[slotIdx],
        [field]: value,
      };
      return {
        ...prev,
        [serviceKey]: {
          ...current,
          slots: nextSlots,
        },
      };
    });
  };

  const handleClearSlot = (serviceKey: ServiceKey, slotIdx: 0 | 1) => {
    handleSlotChange(serviceKey, slotIdx, "phone_number", "");
  };

  const handleReset = () => {
    if (savedBaseline) {
      setFormState(JSON.parse(savedBaseline));
      setValidationError(null);
      setSuccessNotice(null);
    }
  };

  const handleSaveAll = async () => {
    setValidationError(null);
    setError(null);
    setSuccessNotice(null);

    // Validate phone numbers before dispatching
    for (const service of CANONICAL_SERVICES) {
      const current = formState[service.key];
      if (!current) continue;

      for (const slot of current.slots) {
        const rawPhone = (slot.phone_number || "").trim();
        if (rawPhone) {
          const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, "");
          if (!/^\d{5,15}$/.test(cleaned)) {
            setValidationError(
              `Invalid number for ${service.name} (Slot ${slot.slot_index}): "${slot.phone_number}". Phone numbers must contain between 5 and 15 digits.`
            );
            return;
          }
        }
      }
    }

    setIsSaving(true);
    const payload = {
      services: Object.values(formState).map((item) => ({
        service_key: item.service_key,
        slots: item.slots.map((s) => ({
          slot_index: s.slot_index,
          country_code: (s.country_code || "+91").trim(),
          phone_number: (s.phone_number || "").trim().replace(/[\s\-\(\)\.]/g, ""),
          is_active: s.is_active,
        })),
      })),
    };

    const res = await updateAdminContactSettings(payload);
    setIsSaving(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessNotice("Website contact settings updated successfully! Live across all website channels.");
      setSavedBaseline(JSON.stringify(formState));
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessNotice(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-lime-600 shrink-0" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Website Contact Numbers
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-lime-100 text-lime-800 border border-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-600 animate-pulse" />
              Live System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage public phone numbers displayed across the 6 Shafsky website service channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading || isRefreshing || isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-lime-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-lime-700 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Operational Information Banner */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-start gap-3 shadow-xs">
        <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-sky-950">How Website Contact Routing Works:</div>
          <div className="text-sky-800 leading-relaxed">
            • <strong>Slot 1 (Primary)</strong> is the default public number shown on service landing pages and search bars.<br />
            • <strong>Slot 2 (Secondary)</strong> serves as an automatic backup if Slot 1 is inactive or busy.<br />
            • Updates take effect within 30 seconds on the live website without code changes or restarts.
          </div>
        </div>
      </div>

      {/* Alerts */}
      {validationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{validationError}</div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">Failed to save settings: {error}</div>
        </div>
      )}

      {successNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{successNotice}</div>
        </div>
      )}

      {/* Service Grid */}
      {isLoading ? (
        <div className="border border-slate-200 bg-white rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <RefreshCw className="h-8 w-8 text-lime-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-800">Loading website contact settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CANONICAL_SERVICES.map((service) => {
            const current = formState[service.key];
            const Icon = service.icon;

            return (
              <div
                key={service.key}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Service Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                      <Icon className="h-5 w-5 text-lime-700" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {service.name}
                      </h2>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {service.key}
                  </span>
                </div>

                {/* Slot 1 & Slot 2 inputs */}
                <div className="space-y-3.5">
                  {[0, 1].map((slotIdx) => {
                    const slot = current?.slots[slotIdx as 0 | 1];
                    if (!slot) return null;
                    const slotLabel = slotIdx === 0 ? "Slot 1 (Primary)" : "Slot 2 (Secondary)";
                    const isConfigured = Boolean((slot.phone_number || "").trim());

                    return (
                      <div
                        key={slotIdx}
                        className={`p-3 rounded-xl border transition-all ${
                          slot.is_active && isConfigured
                            ? "bg-slate-50/70 border-slate-200"
                            : "bg-white border-dashed border-slate-200 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              {slotLabel}
                            </span>
                            {isConfigured && slot.is_active && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                <Check className="h-3 w-3" />
                                Active
                              </span>
                            )}
                            {isConfigured && !slot.is_active && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                Disabled
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={slot.is_active}
                                onChange={(e) =>
                                  handleSlotChange(
                                    service.key,
                                    slotIdx as 0 | 1,
                                    "is_active",
                                    e.target.checked
                                  )
                                }
                                className="rounded text-lime-600 focus:ring-lime-500 h-3.5 w-3.5"
                              />
                              Enable
                            </label>

                            {isConfigured && (
                              <button
                                type="button"
                                onClick={() => handleClearSlot(service.key, slotIdx as 0 | 1)}
                                title="Clear phone number"
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Country code & Phone number row */}
                        <div className="flex items-center gap-2">
                          <select
                            value={slot.country_code}
                            onChange={(e) =>
                              handleSlotChange(
                                service.key,
                                slotIdx as 0 | 1,
                                "country_code",
                                e.target.value
                              )
                            }
                            className="w-32 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-lime-600 shrink-0"
                          >
                            {POPULAR_COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <div className="relative flex-1">
                            <input
                              type="tel"
                              value={slot.phone_number}
                              placeholder="e.g. 9599087959"
                              onChange={(e) =>
                                handleSlotChange(
                                  service.key,
                                  slotIdx as 0 | 1,
                                  "phone_number",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-lime-600 placeholder:text-slate-300 placeholder:font-sans"
                            />
                          </div>
                        </div>

                        {/* Live dial preview */}
                        {isConfigured && (
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>Dial link:</span>
                            <span className="text-lime-700 font-semibold">
                              tel:{slot.country_code}{slot.phone_number.replace(/[\s\-\(\)\.]/g, "")}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating or Bottom Save Bar */}
      {isDirty && (
        <div className="sticky bottom-4 z-20 rounded-xl bg-slate-900 text-white p-4 shadow-xl flex items-center justify-between gap-4 border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-lime-400" />
            <span className="font-semibold text-slate-200">
              Unsaved changes detected across website contact numbers.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-lime-600 hover:bg-lime-500 text-white shadow-xs transition"
            >
              {isSaving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Live Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
