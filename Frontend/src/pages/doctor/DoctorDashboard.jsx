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

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const authDoctorId = user?.doctorId;

  const [activeSection, setActiveSection] = useState("home");
  const [pdfReport, setPdfReport] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
          Caricamento dati dottore...
        </div>
      </div>
    );
  }

  if (errorDoctor || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-red-600">
          Errore nel caricamento dei dati del dottore.
        </div>
      </div>
    );
  }

  const specLabel =
    specializationLabels[doctor?.specialization] || doctor?.specialization;
  const displayName = doctor?.name || user?.email || "Dottore";

  const linkBase = "w-full text-left px-4 py-2 rounded-lg text-sm";
  const linkActive = "bg-blue-600 text-white";
  const linkInactive = "text-slate-700 hover:bg-slate-200";

  function goSection(key) {
    setActiveSection(key);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Chiudi menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* SIDEBAR DRAWER */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-white border-r shadow-xl transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 py-4 border-b flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold">MyMed Doctor</h1>
            <p className="text-xs text-slate-500">Area Dottore</p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="px-2 py-1 rounded-lg border text-xs text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="p-3 space-y-2">
          <button
            onClick={() => goSection("home")}
            className={`${linkBase} ${
              activeSection === "home" ? linkActive : linkInactive
            }`}
          >
            Home
          </button>

          <button
            onClick={() => goSection("appointments")}
            className={`${linkBase} ${
              activeSection === "appointments" ? linkActive : linkInactive
            }`}
          >
            Appuntamenti
          </button>

          <button
            onClick={() => goSection("patients")}
            className={`${linkBase} ${
              activeSection === "patients" ? linkActive : linkInactive
            }`}
          >
            Pazienti
          </button>

          <button
            onClick={() => goSection("availability")}
            className={`${linkBase} ${
              activeSection === "availability" ? linkActive : linkInactive
            }`}
          >
            Disponibilità
          </button>

          <div className="pt-3 mt-3 border-t">
            <button
              onClick={() => {
                setSidebarOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-4 sm:px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"
            aria-label="Apri menu"
          >
            ☰
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">
                {displayName}
              </span>
              {specLabel && (
                <span className="text-xs text-slate-500 truncate">
                  {specLabel}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
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
