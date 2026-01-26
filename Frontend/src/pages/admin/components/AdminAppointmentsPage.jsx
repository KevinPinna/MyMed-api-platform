import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";
import { specializationToRoleIt } from "../../../lib/labels";

const STATUS_LABELS = {
  SENDED: "Richiesta paziente",
  BOOKED: "Prenotato",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  PENDING_PATIENT: "In attesa paziente",
};

export default function AdminAppointmentsPage() {
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-appointments-list"],
    queryFn: () => api("/api/appointments"),
  });

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    isError: errorDoctors,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const {
    data: patients = [],
    isLoading: loadingPatients,
    isError: errorPatients,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  async function updateStatus(id, action) {
    await api(`/api/appointments/${id}/${action}`, { method: "PATCH" });
    refetch();
  }

  async function remove(id) {
    if (!window.confirm("Eliminare definitivamente l'appuntamento?")) return;
    await api(`/api/appointments/${id}`, { method: "DELETE" });
    refetch();
  }

  const doctorById = useMemo(() => {
    const map = new Map();
    (doctors || []).forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  const patientById = useMemo(() => {
    const map = new Map();
    (patients || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [patients]);

  const sortedAppointments = useMemo(() => {
    const arr = [...(appointments || [])];
    arr.sort((a, b) =>
      String(a.dateTime || "").localeCompare(String(b.dateTime || ""))
    );
    return arr;
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    if (!showOnlyActive) return sortedAppointments;
    return sortedAppointments.filter(
      (a) => a.status !== "COMPLETED" && a.status !== "CANCELED"
    );
  }, [sortedAppointments, showOnlyActive]);

  function renderStatusChip(status) {
    const base =
      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px]";
    if (status === "BOOKED")
      return (
        <span className={`${base} bg-emerald-100 text-emerald-700`}>
          {STATUS_LABELS[status] || status}
        </span>
      );
    if (status === "COMPLETED")
      return (
        <span className={`${base} bg-slate-100 text-slate-700`}>
          {STATUS_LABELS[status] || status}
        </span>
      );
    if (status === "CANCELED")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          {STATUS_LABELS[status] || status}
        </span>
      );
    if (status === "PENDING_PATIENT")
      return (
        <span className={`${base} bg-amber-100 text-amber-700`}>
          {STATUS_LABELS[status] || status}
        </span>
      );
    if (status === "SENDED")
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          {STATUS_LABELS[status] || status}
        </span>
      );
    return (
      <span className={`${base} bg-slate-100 text-slate-700`}>
        {status || "-"}
      </span>
    );
  }

  if (isLoading || loadingDoctors || loadingPatients) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
        Caricamento appuntamenti...
      </div>
    );
  }

  if (isError || errorDoctors || errorPatients) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
        Errore nel caricamento degli appuntamenti:
        <pre className="text-xs mt-1">{String(error?.message || "")}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Appuntamenti totali
          </h1>
          <p className="text-xs text-slate-500">
            Vista sintetica di tutti gli appuntamenti registrati.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-700 sm:justify-end">
          <input
            type="checkbox"
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
          />
          <span className="leading-tight">
            Mostra solo appuntamenti attivi
          </span>
        </label>
      </div>

      {visibleAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-slate-500">
          Nessun appuntamento da mostrare con i filtri correnti.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Wrapper responsive per tabella: scroll orizzontale su mobile */}
          <div className="max-h-[75vh] overflow-auto">
            <div className="min-w-[980px] w-full">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="p-2">Dottore</th>
                    <th className="p-2">Paziente</th>
                    <th className="p-2">Data &amp; ora</th>
                    <th className="p-2">Motivo</th>
                    <th className="p-2">Stato</th>
                    <th className="p-2 w-56 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((a) => {
                    const doctor = doctorById.get(a.doctorId);
                    const patient = patientById.get(a.patientId);

                    const doctorRole = specializationToRoleIt(
                      doctor?.specialization
                    );

                    const doctorName = doctor
                      ? `${doctor.name}${doctorRole ? " • " + doctorRole : ""}`
                      : a.doctorId;

                    const patientName = patient
                      ? `${patient.name} ${patient.surname || ""}`.trim()
                      : a.patientId;

                    const isCompleted = a.status === "COMPLETED";
                    const isCanceled = a.status === "CANCELED";
                    const isBooked = a.status === "BOOKED";

                    const canCancel = !isCanceled && !isCompleted;
                    const canComplete = isBooked;

                    return (
                      <tr key={a.id} className="border-t">
                        <td className="p-2 align-top">{doctorName}</td>
                        <td className="p-2 align-top">{patientName}</td>
                        <td className="p-2 align-top">
                          {a.dateTime ? formatDateTimeRome(a.dateTime) : "N/D"}
                        </td>
                        <td className="p-2 align-top">{a.reason || "-"}</td>
                        <td className="p-2 align-top">
                          {renderStatusChip(a.status)}
                        </td>

                        <td className="p-2 align-top">
                          {/* Azioni responsive: su mobile vanno a capo se serve */}
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => updateStatus(a.id, "cancel")}
                              disabled={!canCancel}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                canCancel
                                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Cancella
                            </button>

                            <button
                              onClick={() => updateStatus(a.id, "complete")}
                              disabled={!canComplete}
                              className={`px-2 py-1 rounded-lg text-xs ${
                                canComplete
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Completa
                            </button>

                            <button
                              onClick={() => remove(a.id)}
                              className="px-2 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700"
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota: min-w + overflow-auto = tabella usabile su mobile senza rompere lo stile */}
        </div>
      )}
    </div>
  );
}
