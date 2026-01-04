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
    return () => { active = false; };
  }, [authEmail]);

  const linkBase =
    "block px-3 py-2 rounded text-sm font-medium hover:bg-slate-200";
  const linkActive = "bg-blue-600 text-white hover:bg-blue-700";

  const displayName = me
    ? `${me.name} ${me.surname}`
    : authEmail || "Admin";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    logout();
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-4 py-4">
          <h1 className="text-lg font-semibold">MyMed Admin</h1>
          <p className="text-xs text-slate-500">
            Area Amministratore
          </p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink to="/admin" end className={({isActive}) =>
            `${linkBase} ${isActive ? linkActive : ""}`}>
            Appuntamenti
          </NavLink>

          <NavLink to="/admin/departments" className={({isActive}) =>
            `${linkBase} ${isActive ? linkActive : ""}`}>
            Reparti
          </NavLink>

          <NavLink to="/admin/patients" className={({isActive}) =>
            `${linkBase} ${isActive ? linkActive : ""}`}>
            Pazienti
          </NavLink>

          <NavLink to="/admin/history" className={({isActive}) =>
            `${linkBase} ${isActive ? linkActive : ""}`}>
            Storico
          </NavLink>

          <NavLink to="/admin/users" className={({isActive}) =>
            `${linkBase} ${isActive ? linkActive : ""}`}>
            Utenti admin
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* COLONNA DESTRA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER TOP */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
          </div>

          <div className="flex items-center gap-3">
            {loadingProfile ? (
              <span className="text-xs text-slate-400">
                Caricamento utente...
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {avatarInitial}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">
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

        <main className="flex-1 p-6 overflow-y-auto">
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
