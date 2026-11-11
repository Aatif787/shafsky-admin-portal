import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  fetchNotificationRecipients,
  fetchRoutingSettings,
  fetchServiceRoutes,
  saveServiceRoutes,
  updateNotificationRecipient,
  type LiveRecipient,
  type NotificationRecipient,
  type ServiceRouting,
} from "../api/notificationRouting";

function formatPhone(digits: string): string {
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return digits ? `+${digits}` : "";
}

function recipientName(recipient: NotificationRecipient): string {
  return recipient.label?.trim() || formatPhone(recipient.phone_number);
}

function assignedIds(service: ServiceRouting): string[] {
  return service.assignments.map((item) => item.recipient_id);
}

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
}

export const WhatsAppNotificationSettings: React.FC = () => {
  const [routingMode, setRoutingMode] = useState<string | null>(null);
  const [liveRecipients, setLiveRecipients] = useState<LiveRecipient[]>([]);
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [services, setServices] = useState<ServiceRouting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [savedIds, setSavedIds] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [busyRecipientId, setBusyRecipientId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NotificationRecipient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingService, setSavingService] = useState<string | null>(null);

  const applyServices = useCallback((next: ServiceRouting[]) => {
    const baseline: Record<string, string[]> = {};
    next.forEach((service) => {
      baseline[service.service_key] = assignedIds(service);
    });
    setServices(next);
    setSavedIds(baseline);
    setDrafts(baseline);
  }, []);

  const load = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    const [recipientResult, routeResult, settingsResult] = await Promise.all([
      fetchNotificationRecipients(),
      fetchServiceRoutes(),
      fetchRoutingSettings(),
    ]);

    if (recipientResult.error || routeResult.error || settingsResult.error) {
      setError(recipientResult.error || routeResult.error || settingsResult.error);
    } else {
      setRoutingMode(settingsResult.data?.routing_mode || "env");
      setLiveRecipients(settingsResult.data?.live_recipients || []);
      setRecipients(recipientResult.data || []);
      applyServices(routeResult.data || []);
      setHasLoaded(true);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, [applyServices]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const recipientById = useMemo(() => {
    const map = new Map<string, NotificationRecipient>();
    recipients.forEach((recipient) => map.set(recipient.id, recipient));
    return map;
  }, [recipients]);

  const showNotice = (message: string) => {
    setError(null);
    setNotice(message);
  };

  const resetAddForm = () => {
    setNewLabel("");
    setNewPhone("");
  };

  const handleAdd = async () => {
    const phone = newPhone.trim();
    if (!phone) {
      setError("Enter a phone number.");
      return;
    }
    setIsAdding(true);
    setError(null);
    const result = await createNotificationRecipient({
      label: newLabel.trim() || null,
      phone_number: phone,
      is_active: true,
    });
    setIsAdding(false);
    if (result.error || !result.data) {
      setError(result.error || "Could not add the recipient.");
      return;
    }
    setRecipients((current) => [...current, result.data as NotificationRecipient]);
    resetAddForm();
    showNotice("Recipient added.");
  };

  const startEdit = (recipient: NotificationRecipient) => {
    setEditingId(recipient.id);
    setEditLabel(recipient.label || "");
    setEditPhone(recipient.phone_number);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const phone = editPhone.trim();
    if (!phone) {
      setError("Enter a phone number.");
      return;
    }
    setIsSavingEdit(true);
    setError(null);
    const result = await updateNotificationRecipient(editingId, {
      label: editLabel.trim() || null,
      phone_number: phone,
    });
    setIsSavingEdit(false);
    if (result.error || !result.data) {
      setError(result.error || "Could not update the recipient.");
      return;
    }
    const updated = result.data;
    setRecipients((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setEditingId(null);
    showNotice("Recipient updated.");
  };

  const handleToggle = async (recipient: NotificationRecipient) => {
    setBusyRecipientId(recipient.id);
    setError(null);
    const result = await updateNotificationRecipient(recipient.id, {
      is_active: !recipient.is_active,
    });
    setBusyRecipientId(null);
    if (result.error || !result.data) {
      setError(result.error || "Could not update the recipient.");
      return;
    }
    const updated = result.data;
    setRecipients((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    showNotice(updated.is_active ? "Recipient enabled." : "Recipient disabled.");
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteNotificationRecipient(pendingDelete.id);
    setIsDeleting(false);
    if (result.error) {
      setError(result.error);
      setPendingDelete(null);
      return;
    }
    const removedId = pendingDelete.id;
    setRecipients((current) => current.filter((item) => item.id !== removedId));
    setDrafts((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((id) => id !== removedId);
      });
      return next;
    });
    setSavedIds((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((id) => id !== removedId);
      });
      return next;
    });
    setPendingDelete(null);
    showNotice("Recipient deleted.");
  };

  const toggleDraft = (serviceKey: string, recipientId: string) => {
    setDrafts((current) => {
      const selected = current[serviceKey] || [];
      const next = selected.includes(recipientId)
        ? selected.filter((id) => id !== recipientId)
        : [...selected, recipientId];
      return { ...current, [serviceKey]: next };
    });
  };

  const cancelDraft = (serviceKey: string) => {
    setDrafts((current) => ({ ...current, [serviceKey]: savedIds[serviceKey] || [] }));
  };

  const handleSaveService = async (serviceKey: string) => {
    setSavingService(serviceKey);
    setError(null);
    const result = await saveServiceRoutes(serviceKey, drafts[serviceKey] || []);
    setSavingService(null);
    if (result.error || !result.data) {
      setError(result.error || "Could not save the service assignment.");
      return;
    }
    const saved = result.data;
    setServices((current) => current.map((item) => (item.service_key === serviceKey ? saved : item)));
    const ids = assignedIds(saved);
    setSavedIds((current) => ({ ...current, [serviceKey]: ids }));
    setDrafts((current) => ({ ...current, [serviceKey]: ids }));
    showNotice(`Assignments saved for ${serviceKey}.`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-lime-700" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">WhatsApp Notifications</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Choose operations recipients and which services they cover.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => load(true)}
          disabled={isLoading || isRefreshing}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {hasLoaded && routingMode === "database" ? (
        <Alert variant="info" title="Live notifications use the service assignments on this page.">
          An alert goes only to active recipients with an active assignment for that service. A service with nobody assigned sends to nobody.
        </Alert>
      ) : hasLoaded ? (
        <Alert variant="info" title="Live notifications currently use environment configuration.">
          The numbers under Currently receiving are the backend numbers getting operations alerts now.
        </Alert>
      ) : null}

      {error && <Alert variant="error">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-lime-700" />
          <p className="mt-3 text-sm font-medium text-slate-700">Loading WhatsApp notification settings...</p>
        </div>
      ) : hasLoaded ? (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Currently receiving</h2>
              <p className="mt-1 text-sm text-slate-500">
                {routingMode === "database"
                  ? "Active recipients with a service assignment. These numbers receive operations alerts now."
                  : "These are the notification numbers already configured in the backend."}
              </p>
            </div>
            {liveRecipients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
                No notification numbers are configured.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {liveRecipients.map((recipient) => (
                  <li key={`${recipient.label}-${recipient.phone_number}`} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{recipient.label}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{formatPhone(recipient.phone_number)}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Receiving
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Saved recipients</h2>
              <p className="mt-1 text-sm text-slate-500">
                Extra recipients stored for service routing. They receive alerts when routing mode is database.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Input
                  label="Name"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                  placeholder="Operations desk"
                  maxLength={120}
                />
                <Input
                  label="Phone number"
                  value={newPhone}
                  onChange={(event) => setNewPhone(event.target.value)}
                  placeholder="9876543210"
                  inputMode="tel"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAdd}
                    isLoading={isAdding}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetAddForm} disabled={isAdding}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            {recipients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
                No WhatsApp recipients yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {recipients.map((recipient) => {
                  const editing = editingId === recipient.id;
                  return (
                    <li key={recipient.id} className="px-4 py-4 sm:px-5">
                      {editing ? (
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                          <Input
                            label="Name"
                            value={editLabel}
                            onChange={(event) => setEditLabel(event.target.value)}
                            maxLength={120}
                          />
                          <Input
                            label="Phone number"
                            value={editPhone}
                            onChange={(event) => setEditPhone(event.target.value)}
                            inputMode="tel"
                          />
                          <div className="flex gap-2">
                            <Button type="button" onClick={handleSaveEdit} isLoading={isSavingEdit}>
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                              disabled={isSavingEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{recipientName(recipient)}</p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  recipient.is_active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {recipient.is_active ? "Active" : "Disabled"}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-slate-500">{formatPhone(recipient.phone_number)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={recipient.is_active}
                              aria-label={recipient.is_active ? "Disable recipient" : "Enable recipient"}
                              disabled={busyRecipientId === recipient.id}
                              onClick={() => handleToggle(recipient)}
                              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                                recipient.is_active ? "bg-lime-600" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  recipient.is_active ? "translate-x-5" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(recipient)}
                              leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setPendingDelete(recipient)}
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Service routing</h2>
              <p className="mt-1 text-sm text-slate-500">
                A recipient can be selected for more than one service.{" "}
                {routingMode === "database"
                  ? "Saving changes who receives that service."
                  : "Saving stores the assignment. Live delivery still uses the environment numbers."}
              </p>
            </div>

            {recipients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
                Add a recipient before assigning services.
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
                No services returned.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {services.map((service) => {
                  const selected = drafts[service.service_key] || [];
                  const dirty = !sameIds(selected, savedIds[service.service_key] || []);
                  const selectedLabels = selected.map((id) => {
                    const recipient = recipientById.get(id);
                    return recipient ? recipientName(recipient) : "Recipient";
                  });
                  return (
                    <div key={service.service_key} className="space-y-3 px-4 py-4 sm:px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{service.service_key}</h3>
                          {selectedLabels.length === 0 ? (
                            <p className="mt-1 text-sm text-slate-500">No recipient assigned.</p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-600">{selectedLabels.join(", ")}</p>
                          )}
                        </div>
                        {dirty && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveService(service.service_key)}
                              isLoading={savingService === service.service_key}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => cancelDraft(service.service_key)}
                              disabled={savingService === service.service_key}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {recipients.map((recipient) => {
                          const checked = selected.includes(recipient.id);
                          return (
                            <label
                              key={recipient.id}
                              className="inline-flex items-center gap-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-lime-700 focus:ring-lime-600"
                                checked={checked}
                                onChange={() => toggleDraft(service.service_key, recipient.id)}
                              />
                              <span>
                                {recipientName(recipient)}
                                {!recipient.is_active && (
                                  <span className="ml-1 text-xs text-slate-400">Disabled</span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-recipient-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <h2 id="delete-recipient-title" className="text-base font-semibold text-slate-900">
              Delete {recipientName(pendingDelete)}?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {pendingDelete.is_active
                ? "Disable this recipient before deleting them."
                : "This removes the recipient. Assigned services must be cleared first."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
