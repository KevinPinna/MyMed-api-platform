import React, { useState } from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const {
    data: admins = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: () => api("/api/admins"),
  });

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
    setSubmitSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      //Crea l'utente applicativo con ruolo ADMIN
      await api("/api/auth/register", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password,
          role: "ADMIN",
        },
      });

      //Crea il profilo di dominio Admin
      await api("/api/admins", {
        method: "POST",
        body: {
          name: form.name,
          surname: form.surname,
          email: form.email,
          phone: form.phone,
        },
      });

      setSubmitSuccess("Utente admin creato e collegato correttamente.");
      setSubmitError("");

      setForm({
        name: "",
        surname: "",
        email: "",
        phone: "",
        password: "",
      });

      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (err) {
      console.error(err);
      setSubmitError(
        err?.message ||
          "Errore nella creazione dell'utente admin. Controlla i dati inseriti."
      );
      setSubmitSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, body }) =>
      api(`/api/admins/${id}`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setEditingAdmin(null);
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id) =>
      api(`/api/admins/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  return (
    <>
      {/* Layout responsive: su mobile impila */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Colonna sinistra: elenco Admin esistenti */}
        <div className="w-full lg:max-w-md bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Utenti amministratori</h2>
            <p className="text-xs text-slate-500">Elenco degli admin.</p>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                Caricamento amministratori...
              </p>
            ) : isError ? (
              <div className="px-4 py-3 text-sm text-red-600">
                Errore nel caricamento degli admin:
                <pre className="text-xs mt-1">
                  {String(error?.message || "Errore sconosciuto")}
                </pre>
              </div>
            ) : admins.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                Nessun amministratore registrato al momento.
              </p>
            ) : (
              <ul className="divide-y text-sm">
                {admins.map((admin) => (
                  <li key={admin.id} className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div>
                        <div className="font-medium text-slate-800">
                          {admin.name} {admin.surname}
                        </div>
                        <div className="text-xs text-slate-500">
                          {admin.email}
                        </div>
                        {admin.phone && (
                          <div className="text-xs text-slate-500">
                            Telefono: {admin.phone}
                          </div>
                        )}
                        <div className="mt-1 text-[11px] text-slate-400">
                          ID: <span className="font-mono">{admin.id}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:flex-col sm:items-end sm:gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(admin)}
                          className="px-2 py-1 rounded-lg border text-[11px] text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
                        >
                          Modifica
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Eliminare definitivamente questo admin? Verrà anche scollegato dall'account utente."
                              )
                            ) {
                              deleteAdminMutation.mutate(admin.id);
                            }
                          }}
                          disabled={deleteAdminMutation.isPending}
                          className="px-2 py-1 rounded-lg text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Colonna destra: form creazione nuovo admin */}
        <div className="w-full lg:flex-1 bg-white border rounded-xl shadow-sm p-4">
          <h3 className="text-base font-semibold mb-1">
            Crea nuovo utente admin
          </h3>

          {submitError && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
              {submitSuccess}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Email (login) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Telefono *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Password (login) *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                required
                minLength={6}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                La password verrà usata dall&apos;admin per accedere al
                pannello.
              </p>
            </div>

            {/* Azioni responsive: su mobile impila */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    name: "",
                    surname: "",
                    email: "",
                    phone: "",
                    password: "",
                  });
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                className="px-3 py-1.5 rounded-lg border text-xs text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 w-full sm:w-auto"
              >
                {isSubmitting ? "Creazione in corso..." : "Crea utente admin"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODIFICA ADMIN */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          isSaving={updateAdminMutation.isPending}
          serverError={
            updateAdminMutation.error
              ? String(updateAdminMutation.error.message || "")
              : ""
          }
          onSave={(payload) =>
            updateAdminMutation.mutate({
              id: editingAdmin.id,
              body: payload,
            })
          }
        />
      )}
    </>
  );
}

function EditAdminModal({ admin, onClose, onSave, isSaving, serverError }) {
  const [name, setName] = useState(admin.name || "");
  const [surname, setSurname] = useState(admin.surname || "");
  const [email, setEmail] = useState(admin.email || "");
  const [phone, setPhone] = useState(admin.phone || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ name, surname, email, phone });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between mb-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Modifica admin</h3>
            <p className="text-xs text-slate-500">
              {admin.name} {admin.surname}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-lg border hover:bg-slate-50"
            disabled={isSaving}
          >
            Chiudi
          </button>
        </div>

        {serverError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Nome</label>
              <input
                type="text"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Cognome</label>
              <input
                type="text"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1">Email (profilo)</label>
            <input
              type="email"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nota: questa è l&apos;email del profilo Admin. L&apos;email di
              login dell&apos;utente potrebbe non aggiornarsi automaticamente
              se cambi questa.
            </p>
          </div>

          <div>
            <label className="block text-xs mb-1">Telefono</label>
            <input
              type="text"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-xs w-full sm:w-auto"
              disabled={isSaving}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isSaving ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
