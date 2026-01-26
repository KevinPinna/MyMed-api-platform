import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";

const STATUS_LABELS = {
  SENDED: "Richiesta paziente",
  BOOKED: "Prenotato",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  PENDING_PATIENT: "In attesa paziente",
};

export default function AdminHistoryPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["admin-history-appointments"],
    queryFn: () => api("/api/appointments"),
  });

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    error: doctorsError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const {
    data: patients = [],
    isLoading: isLoadingPatients,
    error: patientsError,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

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
      String(b.dateTime || "").localeCompare(String(a.dateTime || ""))
    );
    return arr;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "ALL") return sortedAppointments;
    return sortedAppointments.filter((a) => a.status === statusFilter);
  }, [sortedAppointments, statusFilter]);

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

  if (isLoadingAppointments || isLoadingDoctors || isLoadingPatients) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
        Caricamento storico appuntamenti...
      </div>
    );
  }

  if (appointmentsError || doctorsError || patientsError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
        <p>Errore nel caricamento dei dati.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Storico appuntamenti
          </h1>
          <p className="text-xs text-slate-500">
            Vista globale di tutte le visite con il relativo stato.
          </p>
        </div>
        <div className="flex gap-2 text-xs flex-wrap sm:flex-nowrap sm:justify-end sm:ml-4">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full border ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Tutti
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("BOOKED")}
            className={`px-3 py-1 rounded-full border ${
              statusFilter === "BOOKED"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Prenotati
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1 rounded-full border ${
              statusFilter === "COMPLETED"
                ? "bg-slate-800 text-white border-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Completati
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("CANCELED")}
            className={`px-3 py-1 rounded-full border ${
              statusFilter === "CANCELED"
                ? "bg-red-600 text-white border-red-600"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Annullati
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-slate-500">
          Nessun appuntamento presente nello storico con i filtri correnti.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Scroll verticale e orizzontale su schermi piccoli */}
          <div className="max-h-[70vh] overflow-auto">
            <div className="min-w-[860px] w-full">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Data e ora</th>
                    <th className="px-4 py-2">Dottore</th>
                    <th className="px-4 py-2">Paziente</th>
                    <th className="px-4 py-2">Motivo</th>
                    <th className="px-4 py-2">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appt) => {
                    const doctor = doctorById.get(appt.doctorId);
                    const patient = patientById.get(appt.patientId);

                    const doctorName = doctor?.name || appt.doctorId;
                    const patientName = patient
                      ? `${patient.name} ${patient.surname || ""}`.trim()
                      : appt.patientId;

                    return (
                      <tr key={appt.id} className="border-t">
                        <td className="px-4 py-2 align-top">
                          {appt.dateTime
                            ? formatDateTimeRome(appt.dateTime)
                            : "N/D"}
                        </td>
                        <td className="px-4 py-2 align-top">{doctorName}</td>
                        <td className="px-4 py-2 align-top">{patientName}</td>
                        <td className="px-4 py-2 align-top">
                          {appt.reason || "-"}
                        </td>
                        <td className="px-4 py-2 align-top">
                          {renderStatusChip(appt.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
