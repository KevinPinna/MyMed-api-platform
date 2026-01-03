import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AppointmentsPage from "./pages/admin/AppointmentsPage";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import VisitReportPage from "./pages/doctor/VisitReportPage";
import PatientRegisterPage from "./pages/PatientRegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login pubblico */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirect root -> login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Area Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* /admin */}
            <Route index element={<AppointmentsPage />} />

            {/* /admin/departments */}
            <Route
              path="departments"
              element={<div>Reparti (da implementare)</div>}
            />

            {/* /admin/patients */}
            <Route
              path="patients"
              element={<div>Pazienti (da implementare)</div>}
            />

            {/* /admin/history */}
            <Route
              path="history"
              element={<div>Storico (da implementare)</div>}
            />
          </Route>

          {/* Area Dottore */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={["DOCTOR"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* referto stampabile (admin e doctor possono aprirla) */}
          <Route
            path="/reports/appointment/:appointmentId"
            element={<VisitReportPage />}
          />

          {/* Area Paziente */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={["PATIENT"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Placeholder registrazione */}
          <Route path="/register" element={<PatientRegisterPage />} />

          {/* Qualsiasi altra route -> login */}
          <Route path="*" element={<Navigate to="/login" replace />} />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
