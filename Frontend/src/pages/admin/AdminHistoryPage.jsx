import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { formatDateTimeRome } from "../../lib/date";

export default function AdminHistoryPage() {
  // Tutti gli appuntamenti (admin-only)
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["admin-history-appointments"],
    queryFn: () => api("/api/appointments"),
  });

  // Tutti i dottori (per mappare doctorId → nome)
  const {
    data: doctors,
    isLoading: isLoadingDoctors,
    error: doctorsError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  // Tutti i pazienti (per mappare patientId → nome)
  const {
    data: patients,
    isLoading: isLoadingPatients,
    error: patientsError,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  // Loading / error handling
  if (isLoadingAppointments || isLoadingDoctors || isLoadingPatients) {
    return (
      <div className="p-4">
        <p>Caricamento storico appuntamenti...</p>
      </div>
    );
  }

  if (appointmentsError || doctorsError || patientsError) {
    return (
      <div className="p-4 text-red-600">
        <p>Errore nel caricamento dei dati.</p>
        {appointmentsError && <p>Appuntamenti: {appointmentsError.message}</p>}
        {doctorsError && <p>Dottori: {doctorsError.message}</p>}
        {patientsError && <p>Pazienti: {patientsError.message}</p>}
      </div>
    );
  }

  // Crea delle mappe id → oggetto per accesso rapido
  const doctorById = new Map();
  doctors?.forEach((d) => {
    doctorById.set(d.id, d);
  });

  const patientById = new Map();
  patients?.forEach((p) => {
    patientById.set(p.id, p);
  });

  const sortedAppointments = [...(appointments ?? [])].sort(
    (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Storico appuntamenti</h1>

      {sortedAppointments.length === 0 ? (
        <p>Nessun appuntamento presente nello storico.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Data e ora</th>
                <th className="px-4 py-2">Dottore</th>
                <th className="px-4 py-2">Paziente</th>
                <th className="px-4 py-2">Stato</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((appt) => {
                const doctor = doctorById.get(appt.doctorId);
                const patient = patientById.get(appt.patientId);

                const doctorName = doctor
                  ? doctor.name
                  : appt.doctorId; // fallback

                const patientName = patient
                  ? patient.name
                  : appt.patientId; // fallback

                const patientSurname = patient
                  ? patient.surname
                  : appt.patientId; // fallback

                return (
                  <tr key={appt.id} className="border-t">
                    <td className="px-4 py-2">
                      {formatDateTimeRome(appt.dateTime)}
                    </td>
                    <td className="px-4 py-2">{doctorName}</td>
                    <td className="px-4 py-2">{patientName} {patientSurname}</td>
                    <td className="px-4 py-2 capitalize">
                      {appt.status?.toLowerCase() ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
