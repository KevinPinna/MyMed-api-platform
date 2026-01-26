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

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // NEW: sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: patientProfile } = useQuery({
    queryKey: ["patient-profile", user?.patientId],
    queryFn: () => api(`/api/patients/${user.patientId}`),
    enabled: !!user?.patientId,
  });

  const displayName =
    patientProfile?.name && patientProfile?.surname
      ? `${patientProfile.name} ${patientProfile.surname}`
      : user?.email || "Paziente";

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

  const navBtnBase =
    "w-full text-left px-4 py-2 rounded-lg text-sm whitespace-nowrap";
  const navBtn = (key) =>
    `${navBtnBase} ${
      activeSection === key
        ? "bg-blue-600 text-white"
        : "text-slate-700 hover:bg-slate-200"
    }`;

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
        <div className="px-4 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">MyMed Patient</h1>
            <p className="text-xs text-slate-500">Area Paziente</p>
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
          <button onClick={() => goSection("home")} className={navBtn("home")}>
            Home
          </button>

          <button
            onClick={() => goSection("departments")}
            className={navBtn("departments")}
          >
            Reparti
          </button>

          <button
            onClick={() => goSection("appointments")}
            className={navBtn("appointments")}
          >
            Appuntamenti
          </button>

          <button
            onClick={() => goSection("history")}
            className={navBtn("history")}
          >
            Storico visite
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

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b px-3 sm:px-6 flex items-center justify-between">
          {/* LEFT: hamburger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"
              aria-label="Apri menu"
            >
              ☰
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <NotificationsBell
              open={notificationsOpen}
              onToggle={() => setNotificationsOpen((v) => !v)}
              notifications={notifications}
              loading={notificationsLoading}
              onNotificationClick={handleNotificationClick}
              formatDateTimeRome={formatDateTimeRome}
            />

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate max-w-[140px] sm:max-w-none">
                  {displayName}
                </span>
                <span className="text-xs text-slate-500">Paziente</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sections */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto min-w-0">
          {activeSection === "home" && <PatientHomeSection />}
          {activeSection === "departments" && <PatientDepartmentsSection />}
          {activeSection === "appointments" && <PatientAppointmentsSection />}
          {activeSection === "history" && <PatientHistorySection />}
        </main>
      </div>
    </div>
  );
}
