import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";

function formatPatientName(p) {
  if (!p) return "";
  if (p.surname) return `${p.name} ${p.surname}`;
  return p.name;
}

export default function PdfModal({ report, onClose }) {
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

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mb-2 text-sm">
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-black w-full sm:w-auto"
          >
            Chiudi ✕
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
          >
            Stampa / Scarica
          </button>
        </div>

        <div
          id="pdf-print-area"
          className="bg-white shadow-xl border mx-auto w-full h-full overflow-auto"
        >
          <div className="p-4 sm:p-8 text-[13px] leading-relaxed">
            {/* Intestazione */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6 border-b pb-3">
              <div>
                <div className="font-semibold text-xs uppercase tracking-wide">
                  Azienda socio-sanitaria locale
                </div>
                <div className="font-bold text-sm mt-1">
                  Presidio: Clinica MyMed
                </div>
                <div className="text-xs mt-1">
                  Disciplina:{" "}
                  {doctor?.specialization || "Ambulatorio specialistico"}
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
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

            {/* Dati paziente */}
            <div className="border rounded mb-4 text-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between px-3 py-2 border-b">
                <div className="min-w-0">
                  <span className="font-semibold mr-1">Paziente:</span>
                  <span className="uppercase break-words">
                    {patient ? formatPatientName(patient) : report.patientId}
                  </span>
                </div>
                <div className="shrink-0">
                  <span className="font-semibold mr-1">Data visita:</span>
                  {appointment?.dateTime
                    ? formatDateTimeRome(appointment.dateTime)
                    : "N/D"}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between px-3 py-2">
                <div className="min-w-0">
                  <span className="font-semibold mr-1">Dottore:</span>
                  <span className="uppercase break-words">
                    {doctor ? doctor.name : report.doctorId}
                  </span>
                </div>
                <div className="shrink-0">
                  <span className="font-semibold mr-1">Prestazione:</span> Visita
                  specialistica
                </div>
              </div>
            </div>

            {/* Diagnosi */}
            <div className="mt-5">
              <div className="font-bold uppercase text-sm mb-2">Diagnosi</div>
              <div className="border rounded px-3 py-2 min-h-[80px] whitespace-pre-wrap break-words">
                {report.objectiveDiagnosis || "Nessuna diagnosi inserita."}
              </div>
            </div>

            {/* Anamnesi */}
            <div className="mt-4">
              <div className="font-semibold text-sm mb-1">
                Anamnesi patologica
              </div>
              <div className="border rounded px-3 py-2 min-h-[60px] whitespace-pre-wrap break-words">
                {report.anamnesis || "Nessuna anamnesi inserita."}
              </div>
            </div>

            {/* Terapia */}
            <div className="mt-4">
              <div className="font-semibold text-sm mb-1">
                Terapia / Prescrizioni
              </div>
              <div className="border rounded px-3 py-2 min-h-[60px] whitespace-pre-wrap break-words">
                {report.therapy || "Nessuna terapia o prescrizione inserita."}
              </div>
            </div>

            {/* Firma */}
            <div className="mt-8 flex justify-end">
              <div className="text-right text-xs">
                <div className="mb-8">______________________________</div>
                <div>Firma del medico</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
