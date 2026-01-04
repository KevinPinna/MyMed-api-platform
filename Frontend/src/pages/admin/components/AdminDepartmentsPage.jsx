import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";
import {
  specializationToDeptIt,
  specializationToRoleIt,
  DEPARTMENT_OPTIONS,
  dayToItalian,
  shiftToItalian,
  DAY_LABEL_IT,
  SHIFT_LABEL_IT,
} from "../../../lib/labels";

const STATUS_LABELS_IT = {
  SENDED: "Richiesta paziente",
  BOOKED: "Prenotato",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  PENDING_PATIENT: "In attesa paziente",
};

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpecializationForNew, setSelectedSpecializationForNew] =
    useState("");

  const [editingDoctor, setEditingDoctor] = useState(null);

  //tutti i dottori
  const {
    data: doctors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: async (id) => {
      await api(`/api/doctors/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setSelectedDoctor((prev) =>
        prev && prev.id === deletedId ? null : prev
      );
    },
  });

  //UPDATE doctor
  const updateDoctorMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      return api(`/api/doctors/${id}`, { method: "PATCH", body });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });

      setSelectedDoctor((prev) =>
        prev && prev.id === updated.id ? updated : prev
      );
      setEditingDoctor(null);
    },
  });

  const groupedBySpecialization = useMemo(() => {
    const groups = {};
    (doctors || []).forEach((doc) => {
      const spec = doc.specialization || "SENZA_REPARTO";
      if (!groups[spec]) groups[spec] = [];
      groups[spec].push(doc);
    });
    return groups;
  }, [doctors]);

  if (isLoading) return <div>Caricamento reparti...</div>;
  if (error)
    return (
      <div className="text-red-600">
        Errore nel caricamento dei reparti.
      </div>
    );

  const specializations = Object.keys(groupedBySpecialization);

  return (
    <div className="flex gap-6">
      {/* colonna reparti + dottori */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Reparti e dottori</h2>
        </div>

        {specializations.length === 0 && (
          <p className="text-sm text-slate-500">
            Nessun dottore registrato.
          </p>
        )}

        <div className="space-y-4">
          {specializations.map((spec) => {
            const headerLabel =
              spec === "SENZA_REPARTO"
                ? "Senza reparto"
                : specializationToDeptIt(spec);

            return (
              <div key={spec} className="bg-white border rounded shadow-sm">
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <h3 className="font-semibold">{headerLabel}</h3>

                  <button
                    onClick={() => {
                      setSelectedSpecializationForNew(
                        spec === "SENZA_REPARTO" ? "" : spec
                      );
                      setShowAddForm(true);
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                  >
                    Aggiungi dottore
                  </button>
                </div>

                <ul className="divide-y">
                  {groupedBySpecialization[spec].map((doc) => (
                    <li
                      key={doc.id}
                      className="px-4 py-2 flex items-center justify-between gap-2"
                    >
                      <button
                        className="text-sm text-blue-700 hover:underline text-left"
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        {doc.name}
                        <span className="text-xs text-slate-500 ml-2">
                          • {specializationToRoleIt(doc.specialization)}
                        </span>
                      </button>

                      <div className="flex items-center gap-3">
                        {/* MODIFICA */}
                        <button
                          onClick={() => setEditingDoctor(doc)}
                          className="text-xs text-indigo-700 hover:underline"
                        >
                          Modifica
                        </button>

                        {/* RIMUOVI */}
                        <button
                          onClick={() =>
                            deleteDoctorMutation.mutate(doc.id)
                          }
                          className="text-xs text-red-600 hover:underline"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* colonna destra: dettaglio dottore + storico visite */}
      <div className="w-full max-w-md">
        {selectedDoctor ? (
          <DoctorDetailPanel
            doctor={selectedDoctor}
            onEdit={() => setEditingDoctor(selectedDoctor)}
          />
        ) : (
          <div className="bg-white border rounded shadow-sm p-4 text-sm text-slate-500">
            Seleziona un dottore per vedere la scheda e lo storico visite.
          </div>
        )}
      </div>

      {/* form "Aggiungi dottore" */}
      {showAddForm && (
        <AddDoctorModal
          specializationDefault={selectedSpecializationForNew}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* "MODIFICA DOTTORE" */}
      {editingDoctor && (
        <EditDoctorModal
          doctor={editingDoctor}
          isSaving={updateDoctorMutation.isPending}
          serverError={updateDoctorMutation.error?.message}
          onClose={() => setEditingDoctor(null)}
          onSave={(payload) =>
            updateDoctorMutation.mutate({
              id: editingDoctor.id,
              body: payload,
            })
          }
        />
      )}
    </div>
  );
}

/* === Pannello dettaglio dottore + storico visite === */

function DoctorDetailPanel({ doctor, onEdit }) {
  const { id, name, specialization, availabilityDays, availabilityShift } =
    doctor || {};

  // appuntamenti del dottore
  const {
    data: appointments,
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useQuery({
    queryKey: ["appointments", "doctor", id],
    queryFn: () => api(`/api/appointments/doctor/${id}`),
    enabled: !!id,
  });

  // lista pazienti per risalire al nome
  const {
    data: patients,
    isLoading: loadingPatients,
    error: errorPatients,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  const patientMap = new Map((patients || []).map((p) => [p.id, p]));

  const daysText = Array.isArray(availabilityDays)
    ? availabilityDays.map(dayToItalian).join(", ")
    : dayToItalian(availabilityDays);

  return (
    <div className="bg-white border rounded shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">Scheda dottore</h3>
        <button
          onClick={onEdit}
          className="text-xs px-2 py-1 rounded border hover:bg-slate-50"
        >
          Modifica
        </button>
      </div>

      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium">Nome: </span>
          {name}
        </div>

        <div>
          <span className="font-medium">Reparto: </span>
          {specialization ? specializationToDeptIt(specialization) : "N/D"}
        </div>

        <div>
          <span className="font-medium">Specializzazione: </span>
          {specialization ? specializationToRoleIt(specialization) : "N/D"}
        </div>

        <div>
          <span className="font-medium">Giorni disponibili: </span>
          {daysText || "N/D"}
        </div>

        <div>
          <span className="font-medium">Turno: </span>
          {shiftToItalian(availabilityShift)}
        </div>
      </div>

      <div className="pt-2 border-t">
        <h4 className="font-semibold text-sm mb-2">Storico visite</h4>

        {(loadingAppointments || loadingPatients) && (
          <div className="text-xs">Caricamento...</div>
        )}
        {(errorAppointments || errorPatients) && (
          <div className="text-xs text-red-600">
            Errore nel caricamento degli appuntamenti o pazienti.
          </div>
        )}

        {!loadingAppointments &&
          !loadingPatients &&
          !errorAppointments &&
          !errorPatients && (
            <>
              {!appointments || appointments.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nessun appuntamento registrato.
                </p>
              ) : (
                <ul className="max-h-64 overflow-auto divide-y text-xs">
                  {appointments.map((appt) => {
                    const patient = patientMap.get(appt.patientId);
                    const patientName = patient
                      ? `${patient.name} ${patient.surname || ""}`.trim()
                      : appt.patientId;

                    const statusLabel =
                      STATUS_LABELS_IT[appt.status] ||
                      appt.status ||
                      "N/D";

                    let statusClass =
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700";
                    if (appt.status === "BOOKED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700";
                    } else if (appt.status === "COMPLETED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700";
                    } else if (appt.status === "CANCELED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700";
                    } else if (appt.status === "PENDING_PATIENT") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-700";
                    } else if (appt.status === "SENDED") {
                      statusClass =
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700";
                    }

                    return (
                      <li key={appt.id} className="py-2 space-y-0.5">
                        <div className="font-medium">
                          {appt.dateTime
                            ? formatDateTimeRome(appt.dateTime)
                            : "Data non disponibile"}
                        </div>
                        <div className="text-slate-600">
                          Paziente: {patientName}
                        </div>
                        {appt.reason && (
                          <div className="text-slate-600">
                            Motivo: {appt.reason}
                          </div>
                        )}
                        <div className="text-slate-500">
                          Stato:{" "}
                          <span className={statusClass}>{statusLabel}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
      </div>
    </div>
  );
}

function EditDoctorModal({ doctor, onClose, onSave, isSaving, serverError }) {
  const initialDays = Array.isArray(doctor.availabilityDays)
    ? doctor.availabilityDays
    : doctor.availabilityDays
    ? [doctor.availabilityDays]
    : [];

  const [specialization, setSpecialization] = useState(
    doctor.specialization || ""
  );
  const [availabilityShift, setAvailabilityShift] = useState(
    doctor.availabilityShift || ""
  );
  const [days, setDays] = useState(initialDays);

  function toggleDay(dayCode) {
    setDays((prev) =>
      prev.includes(dayCode)
        ? prev.filter((d) => d !== dayCode)
        : [...prev, dayCode]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const availabilityDaysPayload =
      days.length <= 1 ? days[0] || null : days;

    onSave({
      specialization,
      availabilityShift,
      availabilityDays: availabilityDaysPayload,
    });
  }

  const deptLabel = specialization
    ? specializationToDeptIt(specialization)
    : "—";
  const roleLabel = specialization
    ? specializationToRoleIt(specialization)
    : "—";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-semibold">Modifica dottore</h3>
            <p className="text-xs text-slate-500">{doctor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded border hover:bg-slate-50"
          >
            Chiudi
          </button>
        </div>

        {serverError && (
          <div className="text-sm text-red-600 mb-2">
            {String(serverError)}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* REPARTO */}
          <div>
            <label className="block text-sm mb-1">Reparto</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un reparto</option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500 mt-1">
              Reparto: <span className="font-medium">{deptLabel}</span> •
              Specializzazione:{" "}
              <span className="font-medium">{roleLabel}</span>
            </p>
          </div>

          {/* GIORNI */}
          <div>
            <label className="block text-sm mb-2">Giorni disponibili</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(DAY_LABEL_IT).map((dayCode) => (
                <label
                  key={dayCode}
                  className="flex items-center gap-2 text-sm border rounded px-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={days.includes(dayCode)}
                    onChange={() => toggleDay(dayCode)}
                  />
                  {DAY_LABEL_IT[dayCode]}
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seleziona 1 o più giorni.
            </p>
          </div>

          {/* TURNO */}
          <div>
            <label className="block text-sm mb-1">Turno</label>
            <select
              value={availabilityShift}
              onChange={(e) => setAvailabilityShift(e.target.value)}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un turno</option>
              {Object.keys(SHIFT_LABEL_IT).map((shiftCode) => (
                <option key={shiftCode} value={shiftCode}>
                  {SHIFT_LABEL_IT[shiftCode]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded border text-sm"
              disabled={isSaving}
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm disabled:opacity-60"
            >
              {isSaving ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* === Aggiungi dottore === */

function AddDoctorModal({ specializationDefault, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    specialization: specializationDefault || "",
    availabilityDays: "",
    availabilityShift: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const doctor = await api("/api/doctors", {
        method: "POST",
        body: {
          name: form.name,
          specialization: form.specialization,
          availabilityDays: form.availabilityDays,
          availabilityShift: form.availabilityShift,
        },
      });

      await api("/api/auth/register", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password,
          role: "DOCTOR",
          doctorId: doctor.id,
          patientId: null,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        "Errore nella creazione del dottore o delle credenziali."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedMeta = form.specialization
    ? DEPARTMENT_OPTIONS.find((o) => o.value === form.specialization)
    : null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-4">
        <h3 className="text-lg font-semibold mb-3">
          Aggiungi nuovo dottore
        </h3>

        {error && (
          <div className="text-sm text-red-600 mb-2">{error}</div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Nome e cognome</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Reparto</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un reparto</option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500 mt-1">
              Specializzazione associata:{" "}
              <span className="font-medium">
                {selectedMeta?.roleLabel || "—"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Giorno disponibile</label>
            <select
              name="availabilityDays"
              value={form.availabilityDays}
              onChange={handleChange}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un giorno</option>
              <option value="MONDAY">Lunedì</option>
              <option value="TUESDAY">Martedì</option>
              <option value="WEDNESDAY">Mercoledì</option>
              <option value="THURSDAY">Giovedì</option>
              <option value="FRIDAY">Venerdì</option>
              <option value="SATURDAY">Sabato</option>
              <option value="SUNDAY">Domenica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Turno</label>
            <select
              name="availabilityShift"
              value={form.availabilityShift}
              onChange={handleChange}
              className="border rounded w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un turno</option>
              <option value="MORNING">Mattina</option>
              <option value="AFTERNOON">Pomeriggio</option>
              <option value="FULL_DAY">Tutto il giorno</option>
            </select>
          </div>

          <div className="border-t pt-3 mt-2">
            <h4 className="text-sm font-semibold mb-2">
              Credenziali di accesso
            </h4>

            <div>
              <label className="block text-sm mb-1">Email (login)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Password (login)
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="border rounded w-full px-2 py-1 text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded border text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              {isSubmitting ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
