// src/pages/PatientRegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PatientRegisterPage() {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    fiscalCode: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    setLoading(true);

    try {
      await registerPatient({
        name: form.name,
        surname: form.surname,
        fiscalCode: form.fiscalCode.toUpperCase(),
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        confirmPassword: form.confirmPassword, // 👈 IMPORTANTE
      });

      // dopo registrazione + auto-login vai in dashboard paziente
      navigate("/patient");
    } catch (err) {
      console.error(err);
      let msg = "Errore durante la registrazione";

      // se dal backend arriva un JSON con "message" provo a leggerlo
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.message) msg = parsed.message;
      } catch {
        if (err.message) msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Registrazione Paziente
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Nome</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Cognome</label>
              <input
                name="surname"
                value={form.surname}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Codice Fiscale</label>
            <input
              name="fiscalCode"
              value={form.fiscalCode}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
              minLength={16}
              maxLength={16}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Telefono (opzionale)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Conferma Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 mt-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Hai già un account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
