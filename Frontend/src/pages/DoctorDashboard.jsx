import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatDateTimeRome } from "../lib/date";

const specializationLabels = {
  CARDIOLOGY: "Cardiologia",
  DERMATOLOGY: "Dermatologia",
  ENDOCRINOLOGY: "Endocrinologia",
  GASTROENTEROLOGY: "Gastroenterologia",
  NEUROLOGY: "Neurologia",
  ORTHOPEDICS: "Ortopedia",
  PEDIATRICS: "Pediatria",
  PSYCHIATRY: "Psichiatria",
  RADIOLOGY: "Radiologia",
  GENERAL_PRACTICE: "Medicina generale",
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const doctorId = user?.doctorId;

  const [activeTab, setActiveTab] = useState("visits"); // "visits" | "patients"
  const [pdfReport, setPdfReport] = useState(null); // referto selezionato per popup

  const {
    data: doctor,
    isLoading: loadingDoctor,
    isError: errorDoctor,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => api(`/api/doctors/${doctorId}`),
    enabled: !!doctorId,
  });

  if (!doctorId) {
    return (
      <div className="p-6 text-red-600">
        Nessun <code>doctorId</code> trovato nel localStorage / contesto.
        <br />
        Assicurati che dopo il login del dottore vengano salvati{" "}
        <strong>token, email, role, doctorId</strong>.
      </div>
    );
  }

  if (loadingDoctor) {
    return <div className="p-6">Caricamento dati dottore...</div>;
  }

  if (errorDoctor) {
    return (
      <div className="p-6 text-red-600">
        Errore nel caricamento dei dati del dottore.
      </div>
    );
  }

  const specLabel =
    specializationLabels[doctor?.specialization] || doctor?.specialization;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Area Dottore</h2>
          <p className="text-sm text-slate-600 mt-1">{doctor?.name}</p>
          {specLabel && (
            <p className="text-xs text-slate-500">Reparto: {specLabel}</p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-2 text-sm">
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeTab === "visits"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
            onClick={() => setActiveTab("visits")}
          >
            Visite
          </button>

          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeTab === "patients"
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-100"
            }`}
            onClick={() => setActiveTab("patients")}
          >
            Pazienti
          </button>
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 p-6 flex flex-col gap-4">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold">
            Benvenuto, {doctor?.name}
          </h1>
          {specLabel && (
            <p className="text-sm text-slate-600">
              Specializzazione: {specLabel}
            </p>
          )}
        </header>

        <div className="flex-1 bg-slate-50 rounded-xl border shadow-sm p-4">
          {activeTab === "visits" && (
            <DoctorAppointmentsPanel
              doctorId={doctorId}
              onOpenPdf={(report) => setPdfReport(report)}
            />
          )}

          {activeTab === "patients" && (
            <DoctorPatientsPanel
              doctorId={doctorId}
              onOpenPdf={(report) => setPdfReport(report)}
            />
          )}
        </div>
      </main>

      {pdfReport && (
        <PdfModal report={pdfReport} onClose={() => setPdfReport(null)} />
      )}
    </div>
  );
}

/* ===========================
        Pannello VISITE
   =========================== */

function DoctorAppointmentsPanel({ doctorId, onOpenPdf }) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    isError: errorAppointments,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ["appointments", "doctor", doctorId],
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

  // tutti i referti di questo dottore
  const {
    data: allReports = [],
    isLoading: loadingReportsAll,
    isError: errorReportsAll,
  } = useQuery({
    queryKey: ["visit-reports", doctorId, "all"],
    queryFn: () => api(`/api/visit-reports?doctorId=${doctorId}`),
    enabled: !!doctorId,
  });

  const patientMap = useMemo(
    () => new Map(patients.map((p) => [p.id, p])),
    [patients]
  );

  const reportsByAppointment = useMemo(() => {
    const map = new Map();
    (allReports || []).forEach((r) => {
      if (r.appointmentId) map.set(r.appointmentId, r);
    });
    return map;
  }, [allReports]);

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api(`/api/appointments/${id}/cancel`, { method: "PATCH" });
    },
    onSuccess: () => {
      refetchAppointments();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id) => {
      await api(`/api/appointments/${id}/complete`, { method: "PATCH" });
    },
    onSuccess: () => {
      refetchAppointments();
    },
  });

  if (loadingAppointments || loadingPatients || loadingReportsAll) {
    return <div>Caricamento appuntamenti...</div>;
  }

  if (errorAppointments || errorPatients || errorReportsAll) {
    return (
      <div className="text-red-600">
        Errore nel caricamento di appuntamenti, pazienti o referti.
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* colonna sinistra: lista appuntamenti */}
      <div className="w-3/5 bg-white border rounded shadow-sm p-3 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">
          I tuoi appuntamenti
        </h2>

        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nessun appuntamento pianificato.
          </p>
        ) : (
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Paziente</th>
                <th className="p-2 text-left">Data & Ora</th>
                <th className="p-2 text-left">Stato</th>
                <th className="p-2 text-left">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const p = patientMap.get(a.patientId);
                const patientName = p
                  ? p.surname
                    ? `${p.name} ${p.surname}`
                    : p.name
                  : a.patientId;

                const isCompleted =
                  a.status === "COMPLETED" || a.status === "COMPLETE";

                const reportForAppointment =
                  reportsByAppointment.get(a.id) || null;

                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{patientName}</td>
                    <td className="p-2">
                      {formatDateTimeRome(a.dateTime)}
                    </td>
                    <td className="p-2 flex items-center gap-1">
                      {a.status}
                      {isCompleted && reportForAppointment && (
                        <button
                          type="button"
                          onClick={() => onOpenPdf?.(reportForAppointment)}
                          className="inline-flex items-center px-2 py-0.5 text-[11px] rounded border border-red-500 text-red-600 hover:bg-red-50"
                          title="Apri referto (PDF)"
                        >
                          📄
                        </button>
                      )}
                    </td>
                    <td className="p-2 space-x-1">
                      <button
                        className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                        onClick={() => setSelectedAppointment(a)}
                      >
                        Compila referto
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded bg-yellow-500 text-white"
                        onClick={() => cancelMutation.mutate(a.id)}
                      >
                        Cancella
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded bg-green-600 text-white"
                        onClick={() => completeMutation.mutate(a.id)}
                      >
                        Completa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* colonna destra: form referto */}
      <div className="flex-1 bg-white border rounded shadow-sm p-3 flex flex-col">
        {!selectedAppointment ? (
          <div className="text-sm text-slate-500">
            Seleziona un appuntamento per compilare il referto.
          </div>
        ) : (
          <VisitReportForm
            key={selectedAppointment.id}
            appointment={selectedAppointment}
            doctorId={doctorId}
          />
        )}
      </div>
    </div>
  );
}

/* ===========================
          Form Referto
   =========================== */

function VisitReportForm({ appointment, doctorId }) {
  const [message, setMessage] = useState("");

  const {
    data: existingReport,
    isLoading: loadingReport,
    isError: errorReport,
  } = useQuery({
    queryKey: ["visit-report", appointment.id],
    queryFn: () =>
      api(`/api/visit-reports/appointment/${appointment.id}`),
  });

  const saveReportMutation = useMutation({
    mutationFn: async (payload) => {
      await api("/api/visit-reports", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      setMessage("Referto salvato correttamente.");
    },
    onError: () => {
      setMessage("Errore nel salvataggio del referto.");
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const formData = new FormData(e.target);
    const anamnesis = formData.get("anamnesis") || "";
    const objectiveDiagnosis = formData.get("objectiveDiagnosis") || "";
    const therapy = formData.get("therapy") || "";

    await saveReportMutation.mutateAsync({
      doctorId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      anamnesis,
      objectiveDiagnosis,
      therapy,
    });
  }

  return (
    <>
      <h3 className="text-md font-semibold mb-2">
        Referto per visita del {formatDateTimeRome(appointment.dateTime)}
      </h3>

      {loadingReport && (
        <p className="text-xs text-slate-500">
          Caricamento eventuale referto esistente...
        </p>
      )}
      {errorReport && (
        <p className="text-xs text-slate-500">
          Nessun referto esistente (puoi crearne uno nuovo).
        </p>
      )}

      <form
        className="space-y-3 text-sm flex-1 flex flex-col"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-xs mb-1">
            Anamnesi patologica (allergie, anemie, sindromi...)
          </label>
          <textarea
            name="anamnesis"
            defaultValue={existingReport?.anamnesis || ""}
            rows={4}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">
            Diagnosi obiettiva
          </label>
          <textarea
            name="objectiveDiagnosis"
            defaultValue={existingReport?.objectiveDiagnosis || ""}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">
            Terapia / Prescrizioni
          </label>
          <textarea
            name="therapy"
            defaultValue={existingReport?.therapy || ""}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {message && (
          <p className="text-xs text-slate-600">{message}</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Salva referto
          </button>
        </div>
      </form>
    </>
  );
}

/* ===========================
        Pannello PAZIENTI
   =========================== */

function DoctorPatientsPanel({ doctorId, onOpenPdf }) {
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

  const completedAppointments = useMemo(
    () =>
      appointments.filter(
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
    return <div>Caricamento pazienti...</div>;
  }

  if (errorAppointments || errorPatients) {
    return (
      <div className="text-red-600">
        Errore nel caricamento di appuntamenti o pazienti.
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* colonna sinistra: elenco pazienti */}
      <div className="w-1/3 bg-white border rounded shadow-sm p-3 flex flex-col">
        <h3 className="text-sm font-semibold mb-2">Pazienti visitati</h3>

        {patientsForDoctor.length === 0 ? (
          <p className="text-xs text-slate-500">
            Nessun paziente con appuntamenti completati.
          </p>
        ) : (
          <ul className="flex-1 overflow-auto divide-y text-sm">
            {patientsForDoctor.map((p) => (
              <li key={p.id}>
                <button
                  className={`w-full text-left px-2 py-2 hover:bg-slate-100 ${
                    selectedPatient?.id === p.id ? "bg-slate-100 font-medium" : ""
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
      <div className="flex-1 bg-white border rounded shadow-sm p-3 flex flex-col">
        {!selectedPatient ? (
          <div className="text-sm text-slate-500">
            Seleziona un paziente per vedere la cartella clinica
            (storico referti).
          </div>
        ) : (
          <>
            <div className="mb-3">
              <h3 className="text-sm font-semibold">
                Cartella clinica di {formatPatientName(selectedPatient)}
              </h3>
              <p className="text-xs text-slate-500">
                Tutti i referti salvati per questo paziente con questo
                dottore.
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
                {(!reports || reports.length === 0) ? (
                  <p className="text-xs text-slate-500">
                    Nessun referto presente per questo paziente.
                  </p>
                ) : (
                  <ul className="flex-1 overflow-auto divide-y text-xs">
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
                            Apri PDF
                          </button>
                        </div>
                        {r.anamnesis && (
                          <div>
                            <span className="font-semibold">
                              Anamnesi Patologica:{" "}
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
                            <span className="font-semibold">
                              Terapia:{" "}
                            </span>
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

/* ===========================
   Modal "PDF" (preview + stampa)
   Layout stile referto cartella
   =========================== */

function PdfModal({ report, onClose }) {
  const { data: doctor } = useQuery({
    queryKey: ["doctor", report.doctorId, "for-pdf"],
    queryFn: () => api(`/api/doctors/${report.doctorId}`),
    enabled: !!report?.doctorId,
  });

  const { data: patient } = useQuery({
    queryKey: ["patient", report.patientId, "for-pdf"],
    queryFn: () => api(`/api/patients/${report.patientId}`),
    enabled: !!report?.patientId,
  });

  const { data: appointment } = useQuery({
    queryKey: ["appointment", report.appointmentId, "for-pdf"],
    queryFn: () => api(`/api/appointments/${report.appointmentId}`),
    enabled: !!report?.appointmentId,
  });

  function formatPatientName(p) {
    if (!p) return "";
    if (p.surname) return `${p.name} ${p.surname}`;
    return p.name;
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {/* Stili di stampa: mostra solo il foglio del referto */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-print-area, #pdf-print-area * {
            visibility: visible;
          }
          #pdf-print-area {
            position: absolute;
            inset: 0;
            margin: 0;
            padding: 2cm 2cm 2cm 2cm;
            background: white;
          }
        }
      `}</style>

      <div className="bg-transparent w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="flex justify-end mb-2 text-sm">
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-black mr-2"
          >
            Chiudi ✕
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Stampa
          </button>
        </div>

        <div
          id="pdf-print-area"
          className="bg-white shadow-xl border mx-auto w-full h-full overflow-auto"
        >
          {/* “Foglio” del referto */}
          <div className="p-8 text-[13px] leading-relaxed">
            {/* intestazione cartella ambulatoriale */}
            <div className="flex justify-between items-start mb-6 border-b pb-3">
              <div>
                <div className="font-semibold text-xs uppercase tracking-wide">
                  Azienda socio-sanitaria locale
                </div>
                <div className="font-bold text-sm mt-1">
                  Presidio: Clinica MyMed
                </div>
                <div className="text-xs mt-1">
                  Disciplina: {doctor?.specialization || "Ambulatorio specialistico"}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-sm">
                  CARTELLA AMBULATORIALE - DIAGNOSI
                </div>
                <div className="mt-1">
                  Data referto:{" "}
                  {report.createdAt
                    ? formatDateTimeRome(report.createdAt)
                    : "N/D"}
                </div>
              </div>
            </div>

            {/* dati paziente */}
            <div className="border rounded mb-4 text-xs">
              <div className="flex justify-between px-3 py-2 border-b">
                <div>
                  <span className="font-semibold mr-1">Paziente:</span>
                  <span className="uppercase">
                    {patient
                      ? formatPatientName(patient)
                      : report.patientId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold mr-1">
                    Data visita:
                  </span>
                  {appointment?.dateTime
                    ? formatDateTimeRome(appointment.dateTime)
                    : "N/D"}
                </div>
              </div>
              <div className="flex justify-between px-3 py-2">
                <div>
                  <span className="font-semibold mr-1">Dottore:</span>
                  <span className="uppercase">
                    {doctor ? doctor.name : report.doctorId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold mr-1">
                    Prestazione:
                  </span>
                  Visita specialistica
                </div>
              </div>
            </div>

            {/* blocco diagnosi */}
            <div className="mt-5">
              <div className="font-bold uppercase text-sm mb-2">
                Diagnosi
              </div>
              <div className="border rounded px-3 py-2 min-h-[80px] whitespace-pre-wrap">
                {report.objectiveDiagnosis ||
                  "Nessuna diagnosi inserita."}
              </div>
            </div>

            {/* anamnesi */}
            <div className="mt-4">
              <div className="font-semibold text-sm mb-1">
                Anamnesi patologica
              </div>
              <div className="border rounded px-3 py-2 min-h-[60px] whitespace-pre-wrap">
                {report.anamnesis || "Nessuna anamnesi inserita."}
              </div>
            </div>

            {/* terapia */}
            <div className="mt-4">
              <div className="font-semibold text-sm mb-1">
                Terapia / Prescrizioni
              </div>
              <div className="border rounded px-3 py-2 min-h-[60px] whitespace-pre-wrap">
                {report.therapy ||
                  "Nessuna terapia o prescrizione inserita."}
              </div>
            </div>

            {/* firma */}
            <div className="mt-8 flex justify-end">
              <div className="text-right text-xs">
                <div className="mb-8">
                  ______________________________
                </div>
                <div>Firma del medico</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
