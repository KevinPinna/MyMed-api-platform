// src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import AdminAppointmentsPage from "./AppointmentsPage";
import AdminDepartmentsPage from "./AdminDepartments";
import AdminPatientsPage from "./AdminPatientsPAge";
import AdminHistoryPage from "./AdminHistoryPage";

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  const linkBase =
    "block px-3 py-2 rounded text-sm font-medium hover:bg-slate-200";
  const linkActive = "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-4 py-4 border-b">
          <h1 className="text-lg font-semibold">MyMed Admin</h1>
          <p className="text-xs text-slate-500">
            Pannello di amministrazione
          </p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Appuntamenti
          </NavLink>

          <NavLink
            to="/admin/departments"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Reparti
          </NavLink>

          <NavLink
            to="/admin/patients"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Pazienti
          </NavLink>

          <NavLink
            to="/admin/history"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Storico
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Contenuto centrale */}
      <main className="flex-1 p-6">
        <Routes>
          <Route index element={<AdminAppointmentsPage />} />
          <Route path="departments" element={<AdminDepartmentsPage />} />
          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="history" element={<AdminHistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
