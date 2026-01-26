import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";
import VisitReportForm from "./VisitReportForm";
import DoctorRescheduleModal from "./DoctorRescheduleModal";
import { FiFileText } from "react-icons/fi";

export default function DoctorAppointmentsSection({
  doctorId,
  doctor,
  onOpenPdf,
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

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

  // Il dottore vede solo appuntamenti BOOKED
  const visibleAppointments = useMemo(
    () =>
      (appointments || []).filter(
        (a) =>
          a.status !== "COMPLETED" &&
          a.status !== "COMPLETE" &&
          a.status !== "CANCELED"
      ),
    [appointments]
  );

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

  const acceptMutation = useMutation({
    mutationFn: async (id) => {
      return api(`/api/appointments/${id}/doctor-accept`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      refetchAppointments();
    },
  });

  if (loadingAppointments || loadingPatients || loadingReportsAll) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
        Caricamento appuntamenti...
      </div>
    );
  }

  if (errorAppointments || errorPatients || errorReportsAll) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
        Errore nel caricamento di appuntamenti, pazienti o referti.
      </div>
    );
  }

  return (
    <>
      {/* Layout responsive: su mobile impila, da lg torna a 2 colonne */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
        {/* colonna sinistra: lista appuntamenti */}
        <div className="w-full lg:w-3/5 bg-white border rounded-xl shadow-sm p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-3">I tuoi appuntamenti</h2>

          {visibleAppointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nessun appuntamento pianificato.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[480px] overflow-y-auto">
                {/* min-w per evitare tabella “schiacciata” su mobile */}
                <div className="min-w-[880px] w-full">
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Paziente</th>
                        <th className="px-3 py-2 text-left">Data &amp; ora</th>
                        <th className="px-3 py-2 text-left">Motivo</th>
                        <th className="px-3 py-2 text-left">Stato</th>
                        <th className="px-3 py-2 text-left">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAppointments.map((a) => {
                        const p = patientMap.get(a.patientId);
                        const patientName = p
                          ? p.surname
                            ? `${p.name} ${p.surname}`
                            : p.name
                          : a.patientId;

                        const isCompleted =
                          a.status === "COMPLETED" || a.status === "COMPLETE";
                        const isCanceled = a.status === "CANCELED";
                        const isPendingPatient = a.status === "PENDING_PATIENT";
                        const isBooked = a.status === "BOOKED";
                        const isSended = a.status === "SENDED";

                        const reportForAppointment =
                          reportsByAppointment.get(a.id) || null;

                        let statusClass =
                          "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700";
                        if (isBooked) {
                          statusClass =
                            "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-700";
                        } else if (isPendingPatient) {
                          statusClass =
                            "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-amber-100 text-amber-700";
                        } else if (isCanceled) {
                          statusClass =
                            "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-red-100 text-red-700";
                        } else if (isCompleted) {
                          statusClass =
                            "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700";
                        } else if (isSended) {
                          statusClass =
                            "inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-blue-100 text-blue-700";
                        }

                        const statusLabel =
                          a.status === "BOOKED"
                            ? "Prenotato"
                            : a.status === "CANCELED"
                            ? "Annullato"
                            : a.status === "COMPLETED" || a.status === "COMPLETE"
                            ? "Completato"
                            : a.status === "PENDING_PATIENT"
                            ? "In attesa conferma paziente"
                            : a.status === "SENDED"
                            ? "Richiesta da paziente"
                            : a.status;

                        return (
                          <tr key={a.id} className="border-t">
                            <td className="px-3 py-2 align-top">
                              {patientName}
                            </td>

                            <td className="px-3 py-2 align-top">
                              {a.dateTime
                                ? formatDateTimeRome(a.dateTime)
                                : "N/D"}
                            </td>

                            {/* Motivo */}
                            <td className="px-3 py-2 align-top">
                              {a.reason || "-"}
                            </td>

                            <td className="px-3 py-2 align-top">
                              <span className={statusClass}>{statusLabel}</span>

                              {isCompleted && reportForAppointment && (
                                <button
                                  type="button"
                                  onClick={() => onOpenPdf?.(reportForAppointment)}
                                  className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-[11px] rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
                                  title="Apri referto"
                                >
                                  <FiFileText className="text-xs" />
                                  <span>Referto</span>
                                </button>
                              )}
                            </td>

                            <td className="px-3 py-2 align-top">
                              {/* Azioni: wrap + min-w per evitare pulsanti “microscopici” */}
                              <div className="flex flex-wrap gap-1">
                                {/* Accetta solo per SENDED */}
                                {isSended && (
                                  <button
                                    className="px-2 py-1 text-xs rounded bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
                                    onClick={() => acceptMutation.mutate(a.id)}
                                    disabled={acceptMutation.isPending}
                                  >
                                    Accetta
                                  </button>
                                )}

                                <button
                                  className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
                                  onClick={() => setSelectedAppointment(a)}
                                  disabled={isCanceled}
                                >
                                  Compila referto
                                </button>

                                <button
                                  className="px-2 py-1 text-xs rounded bg-indigo-600 text-white disabled:opacity-50"
                                  onClick={() => setRescheduleAppt(a)}
                                  disabled={isCanceled || isCompleted}
                                >
                                  Riprogramma
                                </button>

                                <button
                                  className="px-2 py-1 text-xs rounded bg-yellow-500 text-white disabled:opacity-50"
                                  onClick={() => cancelMutation.mutate(a.id)}
                                  disabled={isCanceled || isCompleted}
                                >
                                  Cancella
                                </button>

                                <button
                                  className="px-2 py-1 text-xs rounded bg-green-600 text-white disabled:opacity-50"
                                  onClick={() => completeMutation.mutate(a.id)}
                                  disabled={!isBooked}
                                >
                                  Completa
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
            </div>
          )}
        </div>

        {/* colonna destra: form referto */}
        <div className="w-full lg:flex-1 bg-white border rounded-xl shadow-sm p-4 flex flex-col">
          {!selectedAppointment ? (
            <div className="text-sm text-slate-500">
              Seleziona un appuntamento per compilare il referto.
            </div>
          ) : (
            <VisitReportForm
              key={selectedAppointment.id}
              appointment={selectedAppointment}
              doctorId={doctorId}
              doctor={doctor}
            />
          )}
        </div>
      </div>

      {/* Modal per riprogrammare appuntamento */}
      {rescheduleAppt && (
        <DoctorRescheduleModal
          appointment={rescheduleAppt}
          doctor={doctor}
          onClose={() => setRescheduleAppt(null)}
          onRescheduled={() => {
            setRescheduleAppt(null);
            refetchAppointments();
          }}
        />
      )}
    </>
  );
}
