import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { formatDateTimeRome } from "../../../lib/date";
import { specializationLabels, statusLabels } from "../../../lib/patientConfig";
import RescheduleModal from "./RescheduleModal";

export default function PatientAppointmentsSection() {
  const { user } = useAuth();
  const patientId = user?.patientId;

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["patientAppointments"],
    queryFn: () => api(`/api/appointments/patient/${patientId}`),
    enabled: !!patientId,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const doctorMap = useMemo(() => {
    const map = new Map();
    (doctors || []).forEach((d) => {
      map.set(d.id, d);
    });
    return map;
  }, [doctors]);

  const sortedAppointments = useMemo(() => {
    const copy = [...appointments];
    copy.sort((a, b) =>
      String(a.dateTime || "").localeCompare(String(b.dateTime || ""))
    );
    return copy;
  }, [appointments]);

  //Nella sezione appuntamenti mostriamo solo quelli BOOKED
  const visibleAppointments = useMemo(
    () =>
      sortedAppointments.filter(
        (a) =>
          a.status !== "COMPLETED" &&
          a.status !== "COMPLETE" &&
          a.status !== "CANCELED"
      ),
    [sortedAppointments]
  );

  const cancelMutation = useMutation({
    mutationFn: (id) =>
      api(`/api/appointments/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      refetch();
    },
  });

  const confirmPendingMutation = useMutation({
    mutationFn: (id) =>
      api(`/api/appointments/${id}/patient-confirm`, { method: "PATCH" }),
    onSuccess: () => {
      refetch();
    },
  });

  const rejectPendingMutation = useMutation({
    mutationFn: (id) =>
      api(`/api/appointments/${id}/patient-reject`, { method: "PATCH" }),
    onSuccess: () => {
      refetch();
    },
  });

  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  function handleCancel(appt) {
    if (
      !window.confirm(
        "Vuoi davvero annullare questo appuntamento? Potrai prenotarne un altro."
      )
    ) {
      return;
    }
    cancelMutation.mutate(appt.id);
  }

  function handleConfirmPending(appt) {
    confirmPendingMutation.mutate(appt.id);
  }

  function handleRejectPending(appt) {
    if (
      !window.confirm(
        "Vuoi rifiutare la modifica proposta dal dottore e annullare l'appuntamento?"
      )
    ) {
      return;
    }
    rejectPendingMutation.mutate(appt.id);
  }

  function renderDoctorInfo(appt) {
    const doctor = doctorMap.get(appt.doctorId);
    if (!doctor) return "Dottore non disponibile";

    const specKey = doctor.specialization;
    const spec = specializationLabels[specKey] || {};
    const titolo = spec.titolo || specKey || "";

    return `${doctor.name}${titolo ? ` · ${titolo}` : ""}`;
  }

  function renderReparto(appt) {
    const doctor = doctorMap.get(appt.doctorId);
    if (!doctor) return "N/D";
    const specKey = doctor.specialization;
    const spec = specializationLabels[specKey] || {};
    return spec.reparto || specKey || "N/D";
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        Caricamento appuntamenti...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-red-600 text-sm">
        Errore nel caricamento degli appuntamenti:
        <pre className="text-xs mt-1">
          {String(error?.message || "Errore sconosciuto")}
        </pre>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">
          I tuoi appuntamenti prenotati
        </h2>

        {visibleAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">
            Non hai appuntamenti prenotati al momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[480px] overflow-y-auto">
              <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Dottore</th>
                    <th className="px-3 py-2 text-left">Reparto</th>
                    <th className="px-3 py-2 text-left">Data &amp; ora</th>
                    <th className="px-3 py-2 text-left">Motivo</th>
                    <th className="px-3 py-2 text-left">Stato</th>
                    <th className="px-3 py-2 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((appt) => {
                    const isBooked = appt.status === "BOOKED";
                    const isPendingPatient =
                      appt.status === "PENDING_PATIENT";
                    const isSended = appt.status === "SENDED";

                    const canModify = isBooked || isSended;
                    const canCancel = isBooked || isSended;

                    let statusClass =
                      "inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700";
                    if (appt.status === "BOOKED") {
                      statusClass =
                        "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700";
                    } else if (appt.status === "CANCELED") {
                      statusClass =
                        "inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700";
                    } else if (appt.status === "PENDING_PATIENT") {
                      statusClass =
                        "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700";
                    } else if (appt.status === "SENDED") {
                      statusClass =
                        "inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700";
                    }

                    const label = statusLabels[appt.status] || appt.status;

                    return (
                      <tr key={appt.id} className="border-t">
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium">
                            {renderDoctorInfo(appt)}
                          </div>
                        </td>

                        <td className="px-3 py-2 align-top">
                          {renderReparto(appt)}
                        </td>

                        <td className="px-3 py-2 align-top">
                          {appt.dateTime
                            ? formatDateTimeRome(appt.dateTime)
                            : "N/D"}
                        </td>

                        <td className="px-3 py-2 align-top">
                          {appt.reason || "-"}
                        </td>

                        <td className="px-3 py-2 align-top">
                          <span className={statusClass}>{label}</span>
                        </td>

                        <td className="px-3 py-2 align-top">
                          <div className="flex justify-end gap-2">
                            {isPendingPatient ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleConfirmPending(appt)
                                  }
                                  disabled={
                                    confirmPendingMutation.isPending
                                  }
                                  className="px-3 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  Conferma cambio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectPending(appt)}
                                  disabled={
                                    rejectPendingMutation.isPending
                                  }
                                  className="px-3 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  Rifiuta e annulla
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={!canModify}
                                  onClick={() => setRescheduleAppt(appt)}
                                  className={`px-3 py-1 rounded text-xs border ${
                                    canModify
                                      ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                                      : "border-slate-300 text-slate-400 cursor-not-allowed"
                                  }`}
                                >
                                  Modifica
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    !canCancel || cancelMutation.isPending
                                  }
                                  onClick={() => handleCancel(appt)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    canCancel
                                      ? "bg-red-600 text-white hover:bg-red-700"
                                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  }`}
                                >
                                  Annulla
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Nota: quando prenoti una visita, l&apos;appuntamento rimane{" "}
          <strong>in attesa di conferma del medico</strong>. Quando il dottore
          accetta, lo stato diventa &quot;Prenotato&quot; e riceverai una
          notifica nella campanella. In caso di cambio data, ti verrà chiesto di
          confermare o rifiutare la proposta.
        </p>
      </div>

      {/* Metodo per riprogrammare appuntamento scelto dal paziente */}
      {rescheduleAppt && (
        <RescheduleModal
          appointment={rescheduleAppt}
          doctor={doctorMap.get(rescheduleAppt.doctorId)}
          onClose={() => setRescheduleAppt(null)}
          onRescheduled={() => {
            setRescheduleAppt(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
