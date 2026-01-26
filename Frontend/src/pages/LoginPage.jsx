import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      if (loggedUser.role === "ADMIN") navigate("/admin");
      else if (loggedUser.role === "DOCTOR") navigate("/doctor");
      else if (loggedUser.role === "PATIENT") navigate("/patient");
      else navigate("/");
    } catch (err) {
      setError(err.message || "Credenziali non valide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              Accesso alla clinica
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Inserisci le credenziali per accedere a MyMed
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Non sei registrato?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Clicca qui
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
