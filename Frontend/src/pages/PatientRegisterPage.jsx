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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
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

      navigate("/patient");
    } catch (err) {
      console.error(err);
      let msg = "Errore durante la registrazione";

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

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              Registrazione Paziente
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Crea il tuo account per prenotare e gestire le visite
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome + Cognome: stacked su mobile, 2 colonne da sm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cognome
                </label>
                <input
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Codice Fiscale
              </label>
              <input
                name="fiscalCode"
                value={form.fiscalCode}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={16}
                maxLength={16}
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Es. RSSMRA85T10A562S"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Deve essere lungo 16 caratteri (verrà salvato in maiuscolo).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telefono (opzionale)
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                autoComplete="tel"
                inputMode="tel"
                placeholder="Es. 3331234567"
              />
            </div>

            {/* Password + Conferma: stacked su mobile, 2 colonne da sm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Conferma Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Registrazione in corso..." : "Registrati"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Hai già un account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Accedi
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4 px-2">
          © {new Date().getFullYear()} MyMed — piattaforma demo
        </p>
      </div>
    </div>
  );
}
