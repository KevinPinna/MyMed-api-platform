import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { formatDateTimeRome } from "../../lib/date";

export default function VisitReportPage() {
  const { appointmentId } = useParams();

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["visit-report", appointmentId],
    queryFn: () => api(`/api/visit-reports/appointment/${appointmentId}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black p-4 sm:p-6">
        <div className="max-w-3xl mx-auto border p-4 sm:p-6 print:border-0">
          Caricamento referto...
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-white text-black p-4 sm:p-6">
        <div className="max-w-3xl mx-auto p-4 text-red-600">
          Referto non trovato per questo appuntamento.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 print:p-0">
      <div className="max-w-3xl mx-auto border p-4 sm:p-6 print:border-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">
              Referto visita specialistica
            </h1>
            <p className="text-sm text-slate-600 break-words">
              Appuntamento ID: {report.appointmentId}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1 text-xs rounded bg-blue-600 text-white no-print w-full sm:w-auto"
          >
            Stampa / PDF
          </button>
        </div>

        <section className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">Dati generali</h2>
          <p className="break-words">Doctor ID: {report.doctorId}</p>
          <p className="break-words">Paziente ID: {report.patientId}</p>
          <p>
            Creato il:{" "}
            {report.createdAt ? formatDateTimeRome(report.createdAt) : "N/D"}
          </p>
        </section>

        <section className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">Anamnesi patologica</h2>
          <div className="border p-2 min-h-[80px] whitespace-pre-wrap break-words">
            {report.anamnesis}
          </div>
        </section>

        <section className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">Diagnosi obiettiva</h2>
          <div className="border p-2 min-h-[80px] whitespace-pre-wrap break-words">
            {report.objectiveDiagnosis}
          </div>
        </section>

        <section className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">Terapie / prescrizioni</h2>
          <div className="border p-2 min-h-[80px] whitespace-pre-wrap break-words">
            {report.therapy}
          </div>
        </section>

        <div className="mt-6 text-right text-sm">
          <p>Firma del medico</p>
          <div className="mt-8 border-t w-40 sm:w-48 ml-auto"></div>
        </div>
      </div>
    </div>
  );
}
