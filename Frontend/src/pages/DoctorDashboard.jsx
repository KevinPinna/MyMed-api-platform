// src/pages/DoctorDashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Area Dottore – {user?.name} {user?.surname}
        </h1>
        <button
          onClick={logout}
          className="px-3 py-2 rounded-lg bg-red-600 text-white"
        >
          Logout
        </button>
      </div>

      <p>Qui poi metteremo gli appuntamenti del dottore, disponibilità, ecc.</p>
    </div>
  );
}
