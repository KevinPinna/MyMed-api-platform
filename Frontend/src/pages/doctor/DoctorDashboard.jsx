// src/pages/doctor/DoctorDashboard.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import specializationLabels from "../../lib/specializationLabels";

import DoctorHomeSection from "./components/DoctorHomeSection";
import DoctorAppointmentsSection from "./components/DoctorAppointmentSection";
import DoctorPatientsSection from "./components/DoctorPatientSection";
import DoctorAvailabilitySection from "./components/DoctorAvailabilitySection";
import PdfModal from "./components/PdfModal";

// ========================
//     DASHBOARD DOTTORE
// ========================

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const authDoctorId = user?.doctorId; //ID del dottore preso dall' auth

  const [activeSection, setActiveSection] = useState("home"); // home | appointments | patients | availability
  const [pdfReport, setPdfReport] = useState(null);

  const {
    data: doctor,
    isLoading: loadingDoctor,
    isError: errorDoctor,
  } = useQuery({
    queryKey: ["doctor", authDoctorId],
    queryFn: () => api(`/api/doctors/${authDoctorId}`),
    enabled: !!authDoctorId,
  });

  if (!authDoctorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md text-sm text-red-600">
          Nessun <code>doctorId</code> trovato nel contesto di autenticazione.
          <br />
          Assicurati che dopo il login del dottore vengano salvati{" "}
          <strong>token, email, role, doctorId</strong>.
        </div>
      </div>
    );
  }

  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
          Caricamento dati dottore...
        </div>
      </div>
    );
  }

  if (errorDoctor || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
          Errore nel caricamento dei dati del dottore.
        </div>
      </div>
    );
  }

  const specLabel =
    specializationLabels[doctor?.specialization] || doctor?.specialization;
  const displayName = doctor?.name || user?.email || "Dottore";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-4">Area Dottore</h2>

        <button
          onClick={() => setActiveSection("home")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "home"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Home
        </button>

        <button
          onClick={() => setActiveSection("appointments")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "appointments"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Appuntamenti
        </button>

        <button
          onClick={() => setActiveSection("patients")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "patients"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Pazienti
        </button>

        <button
          onClick={() => setActiveSection("availability")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "availability"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Disponibilità
        </button>

        <div className="mt-auto pt-4 border-t">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Pannello di controllo dottore
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">
                {displayName}
              </span>
              {specLabel && (
                <span className="text-xs text-slate-500">{specLabel}</span>
              )}
            </div>
          </div>
        </header>

        {/* Sezioni */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === "home" && (
            <DoctorHomeSection doctor={doctor} specLabel={specLabel} />
          )}

          {activeSection === "appointments" && (
            <DoctorAppointmentsSection
              doctorId={authDoctorId}         
              doctor={doctor}
              onOpenPdf={(report) => setPdfReport(report)}
            />
          )}

          {activeSection === "patients" && (
            <DoctorPatientsSection
              doctorId={authDoctorId}
              onOpenPdf={(report) => setPdfReport(report)}
            />
          )}

          {activeSection === "availability" && (
            <DoctorAvailabilitySection doctor={doctor} />
          )}
        </main>
      </div>

      {pdfReport && (
        <PdfModal report={pdfReport} onClose={() => setPdfReport(null)} />
      )}
    </div>
  );
}
