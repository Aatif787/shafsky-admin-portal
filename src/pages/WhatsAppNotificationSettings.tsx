import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  adoptEnvironmentRouting,
  createNotificationRecipient,
  deleteNotificationRecipient,
  fetchNotificationRecipients,
  fetchRoutingSettings,
  fetchServiceRoutes,
  saveRecipientServices,
  updateNotificationRecipient,
  type NotificationRecipient,
  type RouteAssignment,
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

function activeServiceKeys(services: ServiceRouting[], recipientId: string): string[] {
  return services
    .filter((service) =>
      service.assignments.some((item) => item.recipient_id === recipientId && item.is_active)
    )
    .map((service) => service.service_key);
}

function withRecipientServices(
  services: ServiceRouting[],
  recipient: NotificationRecipient,
  serviceKeys: string[]
): ServiceRouting[] {
  const selected = new Set(serviceKeys);
  return services.map((service) => {
    const without = service.assignments.filter((item) => item.recipient_id !== recipient.id);
    const effectiveWithout = service.effective_recipients.filter((item) => item.id !== recipient.id);
    if (!selected.has(service.service_key)) {
      return { ...service, assignments: without, effective_recipients: effectiveWithout };
    }
    const assignment: RouteAssignment = {
      id: `${recipient.id}:${service.service_key}`,
      service_key: service.service_key,
      recipient_id: recipient.id,
      recipient_label: recipient.label,
      phone_number: recipient.phone_number,
      is_active: true,
      recipient_is_active: recipient.is_active,
      effective: recipient.is_active,
    };
    return {
      ...service,
      assignments: [...without, assignment],
      effective_recipients: recipient.is_active ? [...effectiveWithout, recipient] : effectiveWithout,
    };
  });
}

export const WhatsAppNotificationSettings: React.FC = () => {
  const [routingMode, setRoutingMode] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [services, setServices] = useState<ServiceRouting[]>([]);
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
  const [savingServicesId, setSavingServicesId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NotificationRecipient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    const adopted = await adoptEnvironmentRouting();
    if (adopted.error) {
      setError(adopted.error);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const [recipientResult, routeResult, settingsResult] = await Promise.all([
      fetchNotificationRecipients(),
      fetchServiceRoutes(),
      fetchRoutingSettings(),
    ]);

    if (recipientResult.error || routeResult.error || settingsResult.error) {
      setError(recipientResult.error || routeResult.error || settingsResult.error);
    } else {
      setRoutingMode(settingsResult.data?.routing_mode || adopted.data?.routing_mode || "env");
      setRecipients(recipientResult.data || []);
      setServices(routeResult.data || []);
      setHasLoaded(true);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const serviceKeysByRecipient = useMemo(() => {
    const map = new Map<string, string[]>();
    recipients.forEach((recipient) => {
      map.set(recipient.id, activeServiceKeys(services, recipient.id));
    });
    return map;
  }, [recipients, services]);

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
    showNotice("Number added. Select the services it should receive.");
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
      setError(result.error || "Could not update the number.");
      return;
    }
    const updated = result.data;
    setRecipients((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setServices((current) =>
      current.map((service) => ({
        ...service,
        assignments: service.assignments.map((item) =>
          item.recipient_id === updated.id
            ? { ...item, recipient_label: updated.label, phone_number: updated.phone_number }
            : item
        ),
      }))
    );
    setEditingId(null);
    showNotice("Number updated.");
  };

  const handleToggle = async (recipient: NotificationRecipient) => {
    setBusyRecipientId(recipient.id);
    setError(null);
    const result = await updateNotificationRecipient(recipient.id, {
      is_active: !recipient.is_active,
    });
    setBusyRecipientId(null);
    if (result.error || !result.data) {
      setError(result.error || "Could not update the number.");
      return;
    }
    const updated = result.data;
    setRecipients((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    showNotice(updated.is_active ? "Number enabled." : "Number disabled. It will not receive alerts.");
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
    setServices((current) =>
      current.map((service) => ({
        ...service,
        assignments: service.assignments.filter((item) => item.recipient_id !== removedId),
        effective_recipients: service.effective_recipients.filter((item) => item.id !== removedId),
      }))
    );
    setPendingDelete(null);
    showNotice("Number deleted. It no longer receives alerts.");
  };

  const handleServiceToggle = async (recipient: NotificationRecipient, serviceKey: string, checked: boolean) => {
    const currentKeys = serviceKeysByRecipient.get(recipient.id) || [];
    const nextKeys = checked
      ? [...currentKeys, serviceKey]
      : currentKeys.filter((key) => key !== serviceKey);
    setSavingServicesId(recipient.id);
    setError(null);
    const result = await saveRecipientServices(recipient.id, nextKeys);
    setSavingServicesId(null);
    if (result.error || !result.data) {
      setError(result.error || "Could not update the services for this number.");
      return;
    }
    setServices((current) => withRecipientServices(current, recipient, result.data?.service_keys || nextKeys));
    showNotice(
      result.data.service_keys.length === 0
        ? `${recipientName(recipient)} will not receive alerts.`
        : `Services updated for ${recipientName(recipient)}.`
    );
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
            Edit each number, delete it, and choose which services it receives.
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
        <Alert variant="info" title="Live alerts follow the services checked on each number.">
          An active number receives an alert only for the services selected on it. A disabled number, or a number with no services selected, receives nothing.
        </Alert>
      ) : hasLoaded ? (
        <Alert variant="info" title="Live notifications currently use environment configuration.">
          No environment numbers were available to take over, so changes on this page are saved but are not the live delivery list yet.
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
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Notification numbers</h2>
            <p className="mt-1 text-sm text-slate-500">
              These are the numbers that receive operations WhatsApp alerts. Check a service to include that number, or clear every service to stop it.
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
              No WhatsApp numbers yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {recipients.map((recipient) => {
                const editing = editingId === recipient.id;
                const selected = serviceKeysByRecipient.get(recipient.id) || [];
                const savingServices = savingServicesId === recipient.id;
                return (
                  <li key={recipient.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
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
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {selected.length === 0
                                ? "Receives nothing"
                                : `${selected.length} service${selected.length === 1 ? "" : "s"}`}
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

                    <fieldset className="mt-4 border-t border-slate-100 pt-4" disabled={savingServices || editing}>
                      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Services this number receives
                      </legend>
                      {services.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No services returned.</p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {services.map((service) => {
                            const checked = selected.includes(service.service_key);
                            return (
                              <label
                                key={service.service_key}
                                className="inline-flex items-center gap-2 text-sm text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-lime-700 focus:ring-lime-600"
                                  checked={checked}
                                  onChange={(event) =>
                                    handleServiceToggle(recipient, service.service_key, event.target.checked)
                                  }
                                />
                                <span>{service.service_key}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </fieldset>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
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
              This removes the number and every service assigned to it. Alerts stop for this number immediately.
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
