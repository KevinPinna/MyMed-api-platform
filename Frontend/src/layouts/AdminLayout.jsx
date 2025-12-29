// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`block px-3 py-2 rounded-lg ${
        location.pathname === path
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-4">Area Admin</h2>

        {navItem("/admin", "Appuntamenti")}
        {navItem("/admin/departments", "Reparti")}
        {navItem("/admin/patients", "Pazienti")}
        {navItem("/admin/history", "Storico")}

        <button
          onClick={logout}
          className="mt-6 w-full bg-red-600 text-white rounded-lg py-2"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
