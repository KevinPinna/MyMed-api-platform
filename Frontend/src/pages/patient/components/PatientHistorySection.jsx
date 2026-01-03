import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { formatDateTimeRome } from "../../../lib/date";
import { FiFileText, FiX } from "react-icons/fi";

import { patientSpecializationLabels as specializationLabels } from "../../../lib/patientConfig";
import PatientPdfModal from "./PatientPdfModal";

export default function PatientHistorySection() {
  const { user } = useAuth();
  const patientId = user?.patientId;

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patientAppointmentsHistory"],
    queryFn: () => api(`/api/appointments/patient/${patientId}`),
    enabled: !!patientId,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const doctorMap = useMemo(() => {
    const map = new Map();
    (doctors || []).forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  //Nello storico ci sono sia COMPLETED che CANCELED
  const completedAppointments = useMemo(() => {
    const copy = (appointments || []).filter(
      (a) => a.status === "COMPLETED" || a.status === "CANCELED"
    );
    copy.sort((a, b) =>
      String(b.dateTime || "").localeCompare(String(a.dateTime || ""))
    );
    return copy;
  }, [appointments]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
        Caricamento storico visite...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-red-600 text-sm">
        Errore nel caricamento dello storico:
        <pre className="text-xs mt-1">
          {String(error?.message || "Errore sconosciuto")}
        </pre>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">
          Storico visite e referti
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Qui trovi le visite già concluse o annullate. Per le visite completate
          puoi aprire il referto; per quelle annullate vedrai che
          l&apos;appuntamento non è stato effettuato.
        </p>

        {completedAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">
            Non ci sono visite completate o annullate al momento.
          </p>
        ) : (
          // Scrollbar verticale + orizzontale se necessario
          <div className="max-h-[420px] overflow-y-auto overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Data &amp; ora</th>
                  <th className="px-3 py-2 text-left">Dottore</th>
                  <th className="px-3 py-2 text-left">Reparto</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-right">Referto / Esito</th>
                </tr>
              </thead>
              <tbody>
                {completedAppointments.map((appt) => {
                  const isCompleted = appt.status === "COMPLETED";
                  const isCanceled = appt.status === "CANCELED";

                  return (
                    <tr key={appt.id} className="border-t">
                      <td className="px-3 py-2 align-top">
                        {appt.dateTime
                          ? formatDateTimeRome(appt.dateTime)
                          : "N/D"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {renderDoctorInfo(appt)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {renderReparto(appt)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {appt.reason || "-"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex justify-end">
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => setSelectedAppointment(appt)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs border border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <FiFileText className="text-sm" />
                              <span>Vedi referto</span>
                            </button>
                          ) : isCanceled ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs bg-slate-100 text-slate-600 border border-slate-300">
                              <FiX className="text-xs" />
                              <span>Appuntamento non effettuato</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAppointment && selectedAppointment.status === "COMPLETED" && (
        <PatientPdfModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </>
  );
}
