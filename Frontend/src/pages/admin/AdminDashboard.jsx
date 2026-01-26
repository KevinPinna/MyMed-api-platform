import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

import AdminAppointmentsPage from "./components/AdminAppointmentsPage";
import AdminDepartmentsPage from "./components/AdminDepartmentsPage";
import AdminPatientsPage from "./components/AdminPatientsPage";
import AdminHistoryPage from "./components/AdminHistoryPage";
import AdminUsersPage from "./components/AdminUsersPage";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const [me, setMe] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // NEW
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authEmail = user?.email || null;

  useEffect(() => {
    if (!authEmail) {
      setLoadingProfile(false);
      return;
    }

    let active = true;

    async function loadAdminProfile() {
      setLoadingProfile(true);
      try {
        const admins = await api("/api/admins");
        const found = (admins || []).find(
          (a) =>
            typeof a.email === "string" &&
            a.email.toLowerCase().trim() === authEmail.toLowerCase().trim()
        );
        if (active) setMe(found || null);
      } catch (err) {
        console.error("Errore caricamento profilo admin", err);
        if (active) setMe(null);
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    loadAdminProfile();
    return () => {
      active = false;
    };
  }, [authEmail]);

  const linkBase =
    "block px-3 py-2 rounded text-sm font-medium hover:bg-slate-200";
  const linkActive = "bg-blue-600 text-white hover:bg-blue-700";

  const displayName = me ? `${me.name} ${me.surname}` : authEmail || "Admin";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    setSidebarOpen(false);
    logout();
  }

  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? linkActive : ""}`;

  return (
    <div className="min-h-screen flex bg-slate-100">
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
            <h1 className="text-lg font-semibold">MyMed Admin</h1>
            <p className="text-xs text-slate-500">Area Amministratore</p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="px-2 py-1 rounded-lg border text-xs text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Appuntamenti
          </NavLink>

          <NavLink
            to="/admin/departments"
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Reparti
          </NavLink>

          <NavLink
            to="/admin/patients"
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Pazienti
          </NavLink>

          <NavLink
            to="/admin/history"
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Storico
          </NavLink>

          <NavLink
            to="/admin/users"
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            Utenti admin
          </NavLink>
        </nav>

        <div className="px-4 pb-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER TOP */}
        <header className="h-16 bg-white border-b px-4 sm:px-6 flex items-center justify-between">
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"
            aria-label="Apri menu"
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            {loadingProfile ? (
              <span className="text-xs text-slate-400">
                Caricamento utente...
              </span>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {avatarInitial}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {displayName}
                  </span>

                  <span className="text-[11px] text-slate-500">
                    Amministratore
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
          <Routes>
            <Route index element={<AdminAppointmentsPage />} />
            <Route path="departments" element={<AdminDepartmentsPage />} />
            <Route path="patients" element={<AdminPatientsPage />} />
            <Route path="history" element={<AdminHistoryPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
