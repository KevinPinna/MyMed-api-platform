import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatDateTimeRome } from "../../lib/date";

import NotificationsBell from "./components/NotificationsBell";
import PatientHomeSection from "./components/PatientHomeSection";
import PatientDepartmentsSection from "./components/PatientDepartmentsSection";
import PatientAppointmentsSection from "./components/PatientAppointmentsSection";
import PatientHistorySection from "./components/PatientHistorySection";

// ===========================
//     DASHBOARD PAZIENTE
// ===========================

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Profilo paziente per mostrare nome e cognome
  const { data: patientProfile } = useQuery({
    queryKey: ["patient-profile", user?.patientId],
    queryFn: () => api(`/api/patients/${user.patientId}`),
    enabled: !!user?.patientId,
  });

  const displayName =
    patientProfile?.name && patientProfile?.surname
      ? `${patientProfile.name} ${patientProfile.surname}`
      : user?.email || "Paziente";

  // Notifiche dal backend
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api("/api/notifications/my"),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) =>
      api(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      refetchNotifications();
    },
  });

  function handleNotificationClick(notification) {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-4 py-6 flex flex-col gap-2">
        <div className="px-4 py-4">
          <h1 className="text-lg font-semibold">MyMed Patient</h1>
          <p className="text-xs text-slate-500">
            Area Paziente
          </p>
        </div>

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
          onClick={() => setActiveSection("departments")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "departments"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Reparti
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
          onClick={() => setActiveSection("history")}
          className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
            activeSection === "history"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-200"
          }`}
        >
          Storico visite
        </button>

        <div className="mt-auto pt-4">
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
          </div>

          <div className="flex items-center gap-4 relative">
            <NotificationsBell
              open={notificationsOpen}
              onToggle={() => setNotificationsOpen((v) => !v)}
              notifications={notifications}
              loading={notificationsLoading}
              onNotificationClick={handleNotificationClick}
              formatDateTimeRome={formatDateTimeRome}
            />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">
                  {displayName}
                </span>
                <span className="text-xs text-slate-500">Paziente</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sezioni */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === "home" && <PatientHomeSection />}

          {activeSection === "departments" && <PatientDepartmentsSection />}

          {activeSection === "appointments" && <PatientAppointmentsSection />}

          {activeSection === "history" && <PatientHistorySection />}
        </main>
      </div>
    </div>
  );
}
