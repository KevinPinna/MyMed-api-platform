import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";

function DoctorPatientsSection({ doctorId, onOpenPdf }) {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    isError: errorAppointments,
  } = useQuery({
    queryKey: ["appointments", "doctor", doctorId, "for-patients"],
    queryFn: () => api(`/api/appointments/doctor/${doctorId}`),
    enabled: !!doctorId,
  });

  const {
    data: patients = [],
    isLoading: loadingPatients,
    isError: errorPatients,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  // solo appuntamenti completati (COMPLETED / COMPLETE)
  const completedAppointments = useMemo(
    () =>
      (appointments || []).filter(
        (a) => a.status === "COMPLETED" || a.status === "COMPLETE"
      ),
    [appointments]
  );

  const patientsForDoctor = useMemo(() => {
    const map = new Map();

    for (const appt of completedAppointments) {
      const p = patients.find((x) => x.id === appt.patientId);
      if (p && !map.has(p.id)) {
        map.set(p.id, p);
      }
    }

    return Array.from(map.values());
  }, [completedAppointments, patients]);

  function formatPatientName(p) {
    if (!p) return "";
    if (p.surname) return `${p.name} ${p.surname}`;
    return p.name;
  }

  const {
    data: reports = [],
    isLoading: loadingReports,
    isError: errorReports,
  } = useQuery({
    queryKey: ["visit-reports", doctorId, selectedPatient?.id],
    queryFn: () =>
      api(
        `/api/visit-reports?doctorId=${doctorId}&patientId=${selectedPatient.id}`
      ),
    enabled: !!doctorId && !!selectedPatient,
  });

  if (loadingAppointments || loadingPatients) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
        Caricamento pazienti...
      </div>
    );
  }

  if (errorAppointments || errorPatients) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
        Errore nel caricamento di appuntamenti o pazienti.
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* colonna sinistra: elenco pazienti */}
      <div className="w-1/3 bg-white border rounded-xl shadow-sm p-3 flex flex-col">
        <h3 className="text-sm font-semibold mb-2">Pazienti visitati</h3>

        {patientsForDoctor.length === 0 ? (
          <p className="text-xs text-slate-500">
            Nessun paziente con appuntamenti completati.
          </p>
        ) : (
          <ul className="flex-1 overflow-auto max-h-[480px] divide-y text-sm">
            {patientsForDoctor.map((p) => (
              <li key={p.id}>
                <button
                  className={`w-full text-left px-2 py-2 hover:bg-slate-100 ${
                    selectedPatient?.id === p.id
                      ? "bg-slate-100 font-medium"
                      : ""
                  }`}
                  onClick={() => setSelectedPatient(p)}
                >
                  {formatPatientName(p)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* colonna destra: cartella clinica */}
      <div className="flex-1 bg-white border rounded-xl shadow-sm p-3 flex flex-col">
        {!selectedPatient ? (
          <div className="text-sm text-slate-500">
            Seleziona un paziente per vedere la cartella clinica (storico
            referti).
          </div>
        ) : (
          <>
            <div className="mb-3">
              <h3 className="text-sm font-semibold">
                Cartella clinica di {formatPatientName(selectedPatient)}
              </h3>
              <p className="text-xs text-slate-500">
                Tutti i referti salvati per questo paziente con questo dottore.
              </p>
            </div>

            {loadingReports && (
              <div className="text-xs">Caricamento referti...</div>
            )}

            {errorReports && (
              <div className="text-xs text-red-600">
                Errore nel caricamento dei referti.
              </div>
            )}

            {!loadingReports && !errorReports && (
              <>
                {!reports || reports.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Nessun referto presente per questo paziente.
                  </p>
                ) : (
                  <ul className="flex-1 overflow-auto max-h-[480px] divide-y text-xs">
                    {reports.map((r) => (
                      <li key={r.id} className="py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Referto del{" "}
                            {r.createdAt
                              ? formatDateTimeRome(r.createdAt)
                              : "data non disponibile"}
                          </span>
                          <button
                            onClick={() => onOpenPdf?.(r)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Apri referto
                          </button>
                        </div>
                        {r.anamnesis && (
                          <div>
                            <span className="font-semibold">
                              Anamnesi patologica:{" "}
                            </span>
                            {r.anamnesis.length > 80
                              ? r.anamnesis.slice(0, 80) + "..."
                              : r.anamnesis}
                          </div>
                        )}
                        {r.objectiveDiagnosis && (
                          <div>
                            <span className="font-semibold">
                              Diagnosi obiettiva:{" "}
                            </span>
                            {r.objectiveDiagnosis.length > 80
                              ? r.objectiveDiagnosis.slice(0, 80) + "..."
                              : r.objectiveDiagnosis}
                          </div>
                        )}
                        {r.therapy && (
                          <div>
                            <span className="font-semibold">Terapia: </span>
                            {r.therapy.length > 80
                              ? r.therapy.slice(0, 80) + "..."
                              : r.therapy}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorPatientsSection;
