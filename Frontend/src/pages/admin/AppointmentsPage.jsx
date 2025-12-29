// src/pages/admin/AppointmentsPage.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { formatDateTimeRome } from "../../lib/date";
import { specializationToRoleIt } from "../../lib/labels";

async function fetchAppointments() {
  const items = await api("/api/appointments");

  const enriched = await Promise.all(
    items.map(async (a) => {
      const doctor = await api(`/api/doctors/${a.doctorId}`);
      const patient = await api(`/api/patients/${a.patientId}`);

      const doctorRole = specializationToRoleIt(doctor?.specialization);

      return {
        ...a,
        doctorName: doctor?.name ? `${doctor.name} • ${doctorRole}` : a.doctorId,
        patientName: patient
          ? `${patient.name} ${patient.surname}`
          : a.patientId,
      };
    })
  );

  return enriched;
}

export default function AppointmentsPage() {
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  async function updateStatus(id, action) {
    // Se nel backend hai PATCH /{id}/cancel e PATCH /{id}/complete:
    // await api(`/api/appointments/${id}/${action}`, { method: "PATCH" });

    // Se invece hai davvero PUT /{id}/{status} lascia così:
    await api(`/api/appointments/${id}/${action}`, { method: "PUT" });

    refetch();
  }

  async function remove(id) {
    if (!confirm("Eliminare definitivamente l'appuntamento?")) return;
    await api(`/api/appointments/${id}`, { method: "DELETE" });
    refetch();
  }

  if (isLoading) return <div>Caricamento appuntamenti...</div>;

  if (isError)
    return (
      <div className="text-red-600">
        Errore nel caricamento degli appuntamenti:
        <pre className="text-xs">{String(error?.message || "")}</pre>
      </div>
    );

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Appuntamenti Totali</h1>

      <table className="w-full border bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Dottore</th>
            <th className="p-2 text-left">Paziente</th>
            <th className="p-2 text-left">Data & Ora</th>
            <th className="p-2 text-left">Stato</th>
            <th className="p-2 w-56"></th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.doctorName}</td>
              <td className="p-2">{a.patientName}</td>
              <td className="p-2">{formatDateTimeRome(a.dateTime)}</td>
              <td className="p-2">{a.status}</td>

              <td className="p-2 flex gap-2">
                <button
                  onClick={() => updateStatus(a.id, "cancel")}
                  className="px-2 py-1 rounded bg-yellow-500 text-white"
                >
                  Cancella
                </button>

                <button
                  onClick={() => updateStatus(a.id, "complete")}
                  className="px-2 py-1 rounded bg-green-600 text-white"
                >
                  Completato
                </button>

                <button
                  onClick={() => remove(a.id)}
                  className="px-2 py-1 rounded bg-red-600 text-white"
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
