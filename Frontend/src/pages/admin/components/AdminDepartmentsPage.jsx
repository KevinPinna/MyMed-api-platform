import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";
import {
  specializationToDeptIt,
  specializationToRoleIt,
  DEPARTMENT_OPTIONS,
} from "../../../lib/labels";
import { weekdayCodes, weekdayLabels } from "../../../lib/weekdays";

const STATUS_LABELS_IT = {
  SENDED: "Richiesta paziente",
  BOOKED: "Prenotato",
  COMPLETED: "Completato",
  CANCELED: "Annullato",
  PENDING_PATIENT: "In attesa paziente",
};

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();

  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpecializationForNew, setSelectedSpecializationForNew] =
    useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);

  // tutti i dottori
  const {
    data: doctors = [],
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

  const updateDoctorMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      // PATCH: specializzazione / giorni / turno
      return api(`/api/doctors/${id}`, {
        method: "PATCH",
        body,
      });
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        Caricamento reparti...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-red-600 text-sm">
        Errore nel caricamento dei reparti.
      </div>
    );
  }

  const specKeys = Object.keys(groupedBySpecialization);

  function handleSelectSpec(spec) {
    setSelectedSpec(spec);
    setSelectedDoctor(null);
  }

  return (
    <>
      <div className="flex gap-6">
        {/* Colonna sinistra: reparti */}
        <div className="w-64 bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Reparti</h2>
          </div>

          {specKeys.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nessun dottore registrato.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {specKeys.map((spec) => {
                const label =
                  spec === "SENZA_REPARTO"
                    ? "Senza reparto"
                    : specializationToDeptIt(spec);

                return (
                  <li key={spec}>
                    <button
                      type="button"
                      onClick={() => handleSelectSpec(spec)}
                      className={`w-full text-left px-3 py-2 rounded-lg ${
                        selectedSpec === spec
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Colonna centrale: dottori del reparto */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Dottori del reparto</h2>

            {selectedSpec && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecializationForNew(
                    selectedSpec === "SENZA_REPARTO" ? "" : selectedSpec
                  );
                  setShowAddForm(true);
                }}
                className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Aggiungi dottore
              </button>
            )}
          </div>

          {!selectedSpec ? (
            <p className="text-xs text-slate-500">
              Seleziona prima un reparto sulla sinistra.
            </p>
          ) : (
            <>
              {groupedBySpecialization[selectedSpec]?.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nessun dottore in questo reparto.
                </p>
              ) : (
                <ul className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                  {groupedBySpecialization[selectedSpec].map((doc) => (
                    <li key={doc.id}>
                      <DoctorCard
                        doctor={doc}
                        onSelect={() => setSelectedDoctor(doc)}
                        onEdit={() => setEditingDoctor(doc)}
                        onRemove={() =>
                          deleteDoctorMutation.mutate(doc.id)
                        }
                        selected={selectedDoctor?.id === doc.id}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Colonna destra: scheda dottore + storico visite */}
        <div className="w-[420px]">
          {selectedDoctor ? (
            <DoctorDetailPanel
              doctor={selectedDoctor}
              onEdit={() => setEditingDoctor(selectedDoctor)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-4 text-xs text-slate-500">
              Seleziona un dottore per vedere la scheda e lo storico
              visite.
            </div>
          )}
        </div>
      </div>

      {/* Aggiungi dottore */}
      {showAddForm && (
        <AddDoctorModal
          specializationDefault={selectedSpecializationForNew}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Modifica dottore (disponibilità/specializzazione) */}
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
    </>
  );
}

/* === DoctorCard === */

function DoctorCard({ doctor, onSelect, onEdit, onRemove, selected }) {
  const specKey = doctor.specialization;
  const deptLabel = specKey ? specializationToDeptIt(specKey) : "";
  const roleLabel = specKey ? specializationToRoleIt(specKey) : "";

  const days = Array.isArray(doctor.availabilityDays)
    ? doctor.availabilityDays
    : doctor.availabilityDays
    ? [doctor.availabilityDays]
    : [];

  function renderShiftLabel(shift) {
    if (!shift) return "N/D";
    if (shift === "MORNING") return "Mattina (09:00 - 13:00)";
    if (shift === "AFTERNOON") return "Pomeriggio (14:00 - 18:00)";
    return "Giornata intera (09:00 - 18:00)";
  }

  return (
    <div
      className={`w-full border rounded-lg px-3 py-2 text-left text-sm flex flex-col gap-1 ${
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="text-left flex-1"
        >
          <div className="font-semibold text-slate-800">
            {doctor.name}
          </div>
          <div className="text-xs text-slate-600">
            {roleLabel && <span>{roleLabel}</span>}
            {deptLabel && (
              <span className="ml-1 text-slate-500">· {deptLabel}</span>
            )}
          </div>

          {days.length > 0 && (
            <div className="text-[11px] text-slate-500">
              Giorni: {days.map((d) => weekdayLabels[d] || d).join(", ")}
            </div>
          )}

          {doctor.availabilityShift && (
            <div className="text-[11px] text-slate-500">
              Orario: {renderShiftLabel(doctor.availabilityShift)}
            </div>
          )}
        </button>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="text-[11px] px-2 py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            Modifica
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] px-2 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50"
          >
            Rimuovi
          </button>
        </div>
      </div>
    </div>
  );
}

//Pannello dettaglio dottore + storico visite

function DoctorDetailPanel({ doctor, onEdit }) {
  const { id, name, specialization, availabilityDays, availabilityShift } =
    doctor || {};

  // appuntamenti del dottore
  const {
    data: appointments = [],
    isLoading: loadingAppointments,
    error: errorAppointments,
  } = useQuery({
    queryKey: ["appointments", "doctor", id],
    queryFn: () => api(`/api/appointments/doctor/${id}`),
    enabled: !!id,
  });

  // lista pazienti
  const {
    data: patients = [],
    isLoading: loadingPatients,
    error: errorPatients,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api("/api/patients"),
  });

  const patientMap = useMemo(
    () => new Map((patients || []).map((p) => [p.id, p])),
    [patients]
  );

  const daysText = useMemo(() => {
    if (!availabilityDays || availabilityDays.length === 0) return "";
    const arr = Array.isArray(availabilityDays)
      ? availabilityDays
      : [availabilityDays];
    return arr.map((code) => weekdayLabels[code] || code).join(", ");
  }, [availabilityDays]);

  function renderShiftLabel(shift) {
    if (!shift) return "N/D";
    if (shift === "MORNING") return "Mattina (09:00 - 13:00)";
    if (shift === "AFTERNOON") return "Pomeriggio (14:00 - 18:00)";
    return "Giornata intera (09:00 - 18:00)";
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 space-y-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Scheda dottore</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione anagrafica e disponibilità.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50"
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
          {renderShiftLabel(availabilityShift)}
        </div>
      </div>

      <div className="pt-2 border-t">
        <h4 className="font-semibold text-xs mb-2">Storico visite</h4>

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
                <ul className="max-h-64 overflow-auto divide-y text-xs pr-1">
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

//Modifica dottore

function EditDoctorModal({ doctor, onClose, onSave, isSaving, serverError }) {
  const initialDays = Array.isArray(doctor.availabilityDays)
    ? doctor.availabilityDays
    : doctor.availabilityDays
    ? [doctor.availabilityDays]
    : [];

  const [specialization, setSpecialization] = useState(
    doctor.specialization || ""
  );
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [shift, setShift] = useState(doctor.availabilityShift || "FULL_DAY");

  function toggleDay(code) {
    setSelectedDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      specialization,
      availabilityDays: selectedDays,
      availabilityShift: shift,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 max-h-[90vh] flex flex-col">
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

        <form
          className="space-y-4 text-sm overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          {/* REPARTO (specialization) */}
          <div>
            <label className="block text-xs mb-1">Reparto</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="border rounded-lg w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un reparto</option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-500 mt-1">
              Ruolo:{" "}
              <span className="font-medium">
                {specialization ? specializationToRoleIt(specialization) : "—"}
              </span>
            </p>
          </div>

          {/* Giorni disponibili */}
          <div>
            <label className="block text-xs mb-1">
              Giorni in cui lavora
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Seleziona uno o più giorni della settimana.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {weekdayCodes
                .filter((code) => code !== "SUNDAY")
                .concat(["SUNDAY"])
                .map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleDay(code)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left ${
                      selectedDays.includes(code)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {weekdayLabels[code] || code}
                  </button>
                ))}
            </div>

            {selectedDays.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Nessun giorno selezionato: i pazienti non potranno
                prenotare appuntamenti.
              </p>
            )}
          </div>

          {/* Fascia oraria */}
          <div>
            <label className="block text-xs mb-1">
              Fascia oraria di lavoro
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Utilizzata per generare gli slot di prenotazione dei
              pazienti.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="MORNING"
                  checked={shift === "MORNING"}
                  onChange={() => setShift("MORNING")}
                />
                <div>
                  <div className="font-semibold">Mattina</div>
                  <div className="text-[11px] text-slate-500">
                    09:00 - 13:00
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="AFTERNOON"
                  checked={shift === "AFTERNOON"}
                  onChange={() => setShift("AFTERNOON")}
                />
                <div>
                  <div className="font-semibold">Pomeriggio</div>
                  <div className="text-[11px] text-slate-500">
                    14:00 - 18:00
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="FULL_DAY"
                  checked={shift === "FULL_DAY"}
                  onChange={() => setShift("FULL_DAY")}
                />
                <div>
                  <div className="font-semibold">Giornata intera</div>
                  <div className="text-[11px] text-slate-500">
                    09:00 - 18:00
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg border text-sm"
              disabled={isSaving}
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-60"
            >
              {isSaving ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//Aggiungi dottore

function AddDoctorModal({ specializationDefault, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    specialization: specializationDefault || "",
    email: "",
    password: "",
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [shift, setShift] = useState("FULL_DAY");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleDay(code) {
    setSelectedDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      //crea Doctor 
      const doctor = await api("/api/doctors", {
        method: "POST",
        body: {
          name: form.name,
          specialization: form.specialization,
          availabilityDays: selectedDays,
          availabilityShift: shift,
        },
      });

      //crea UserAccount collegato al DOCTOR
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
        err?.message ||
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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">
              Aggiungi nuovo dottore
            </h3>
            <p className="text-xs text-slate-500">
              Crea profilo dottore e utenza di accesso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-2 py-1 rounded border hover:bg-slate-50"
          >
            Chiudi
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-2">{error}</div>
        )}

        <form
          className="space-y-3 text-sm overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          {/* Nome */}
          <div>
            <label className="block text-xs mb-1">Nome e cognome</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded-lg w-full px-2 py-1 text-sm"
              required
            />
          </div>

          {/* Reparto / specializzazione */}
          <div>
            <label className="block text-xs mb-1">Reparto</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="border rounded-lg w-full px-2 py-1 text-sm"
              required
            >
              <option value="">Seleziona un reparto</option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-500 mt-1">
              Specializzazione associata:{" "}
              <span className="font-medium">
                {selectedMeta?.roleLabel || "—"}
              </span>
            </p>
          </div>

          {/* Giorni disponibili */}
          <div>
            <label className="block text-xs mb-1">
              Giorni disponibili
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Seleziona uno o più giorni lavorativi per questo dottore.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {weekdayCodes
                .filter((code) => code !== "SUNDAY")
                .concat(["SUNDAY"])
                .map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleDay(code)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left ${
                      selectedDays.includes(code)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {weekdayLabels[code] || code}
                  </button>
                ))}
            </div>

            {selectedDays.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Nessun giorno selezionato: i pazienti non potranno
                prenotare appuntamenti.
              </p>
            )}
          </div>

          {/* Fascia oraria */}
          <div>
            <label className="block text-xs mb-1">
              Fascia oraria di lavoro
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Serve a generare gli slot di prenotazione (come nella
              schermata paziente).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="MORNING"
                  checked={shift === "MORNING"}
                  onChange={() => setShift("MORNING")}
                />
                <div>
                  <div className="font-semibold">Mattina</div>
                  <div className="text-[11px] text-slate-500">
                    09:00 - 13:00
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="AFTERNOON"
                  checked={shift === "AFTERNOON"}
                  onChange={() => setShift("AFTERNOON")}
                />
                <div>
                  <div className="font-semibold">Pomeriggio</div>
                  <div className="text-[11px] text-slate-500">
                    14:00 - 18:00
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shift"
                  value="FULL_DAY"
                  checked={shift === "FULL_DAY"}
                  onChange={() => setShift("FULL_DAY")}
                />
                <div>
                  <div className="font-semibold">Giornata intera</div>
                  <div className="text-[11px] text-slate-500">
                    09:00 - 18:00
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Credenziali utente */}
          <div className="border-t pt-3 mt-2">
            <h4 className="text-sm font-semibold mb-2">
              Credenziali di accesso
            </h4>

            <div className="space-y-2">
              <div>
                <label className="block text-xs mb-1">Email (login)</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="border rounded-lg w-full px-2 py-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs mb-1">
                  Password (login)
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="border rounded-lg w-full px-2 py-1 text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg border text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              {isSubmitting ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
