import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";

const STATUS_LABELS_IT = {
  SENDED: "Richiesta paziente",
  BOOKED: "Prenotato",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  PENDING_PATIENT: "In attesa paziente",
};

export default function AdminPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    data: patients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  if (isLoading) return <div>Caricamento pazienti...</div>;
  if (error)
    return (
      <div className="text-red-600">
        Errore nel caricamento dei pazienti.
      </div>
    );

  return (
    <div className="flex gap-6">
      {/* elenco pazienti */}
      <div className="w-full max-w-sm bg-white border rounded shadow-sm">
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">Pazienti</h2>
        </div>
        {patients.length === 0 ? (
          <p className="px-4 py-2 text-sm text-slate-500">
            Nessun paziente registrato.
          </p>
        ) : (
          <ul className="max-h-[70vh] overflow-auto divide-y">
            {patients.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedPatient(p)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm"
                >
                  <div className="font-medium">
                    {p.name} {p.surname}
                  </div>
                  {p.email && (
                    <div className="text-xs text-slate-500">
                      {p.email}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* dettaglio paziente + storico */}
      <div className="flex-1">
        {selectedPatient ? (
          <PatientHistoryPanel patient={selectedPatient} />
        ) : (
          <div className="bg-white border rounded shadow-sm p-4 text-sm text-slate-500">
            Seleziona un paziente per vedere lo storico degli appuntamenti.
          </div>
        )}
      </div>
    </div>
  );
}

function PatientHistoryPanel({ patient }) {
  const { id, name, surname, email } = patient || {};

  const {
    data: appointments,
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useQuery({
    queryKey: ["appointments", "patient", id],
    queryFn: () => api(`/api/appointments/patient/${id}`),
    enabled: !!id,
  });

  //Prende il nome dei dottori
  const {
    data: doctors,
    isLoading: loadingDoctors,
    error: errorDoctors,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const doctorMap = new Map((doctors || []).map((d) => [d.id, d]));

  return (
    <div className="bg-white border rounded shadow-sm p-4 space-y-3">
      <h3 className="text-lg font-semibold">Scheda paziente</h3>

      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium">Nome: </span>
          {name}
        </div>
        <div>
          <span className="font-medium">Cognome: </span>
          {surname}
        </div>
        {email && (
          <div>
            <span className="font-medium">Email: </span>
            {email}
          </div>
        )}
      </div>

      <div className="pt-2 border-t">
        <h4 className="font-semibold text-sm mb-2">
          Storico appuntamenti
        </h4>

        {(loadingAppointments || loadingDoctors) && (
          <div className="text-xs">Caricamento...</div>
        )}
        {(errorAppointments || errorDoctors) && (
          <div className="text-xs text-red-600">
            Errore nel caricamento degli appuntamenti o dottori.
          </div>
        )}

        {!loadingAppointments &&
          !loadingDoctors &&
          !errorAppointments &&
          !errorDoctors && (
            <>
              {!appointments || appointments.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nessun appuntamento registrato.
                </p>
              ) : (
                <ul className="max-h-64 overflow-auto divide-y text-xs">
                  {appointments.map((appt) => {
                    const doctor = doctorMap.get(appt.doctorId);
                    const doctorName = doctor?.name || appt.doctorId;

                    const statusLabel =
                      STATUS_LABELS_IT[appt.status] ||
                      appt.status ||
                      "N/D";

                    let statusClass =
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700";
                    if (appt.status === "BOOKED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700";
                    } else if (appt.status === "COMPLETED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700";
                    } else if (appt.status === "CANCELED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700";
                    } else if (appt.status === "PENDING_PATIENT") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-700";
                    } else if (appt.status === "SENDED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700";
                    }

                    return (
                      <li key={appt.id} className="py-2 space-y-0.5">
                        <div className="font-medium">
                          {appt.dateTime
                            ? formatDateTimeRome(appt.dateTime)
                            : "Data non disponibile"}
                        </div>
                        <div className="text-slate-600">
                          Dottore: {doctorName}
                        </div>
                        {appt.reason && (
                          <div className="text-slate-600">
                            Motivo: {appt.reason}
                          </div>
                        )}
                        <div className="text-slate-500">
                          Stato:{" "}
                          <span className={statusClass}>{statusLabel}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
      </div>
    </div>
  );
}
