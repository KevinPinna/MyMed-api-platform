import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { FiX } from "react-icons/fi";

import {
  patientSpecializationLabels,
  examTypesBySpecialization,
  weekdayCodes,
  weekdayLabels,
} from "../../../lib/patientConfig";

export default function PatientDepartmentsSection() {
  const { data: doctors = [], isLoading, isError, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api("/api/doctors"),
  });

  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const groupedBySpec = useMemo(() => {
    const groups = {};
    (doctors || []).forEach((doc) => {
      const specKey = doc.specialization || "SENZA_REPARTO";
      if (!groups[specKey]) groups[specKey] = [];
      groups[specKey].push(doc);
    });
    return groups;
  }, [doctors]);

  const specKeys = Object.keys(groupedBySpec).filter(
    (s) => s !== "SENZA_REPARTO"
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        Caricamento reparti...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-red-600 text-sm">
        Errore nel caricamento dei reparti:
        <pre className="text-xs mt-1">
          {String(error?.message || "Errore sconosciuto")}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Colonna reparti */}
      <div className="w-64 bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-sm font-semibold mb-3">Reparti disponibili</h2>

        {specKeys.length === 0 && (
          <p className="text-xs text-slate-500">
            Nessun reparto configurato.
          </p>
        )}

        <ul className="space-y-1 text-sm">
          {specKeys.map((spec) => {
            const label =
              patientSpecializationLabels[spec]?.reparto || spec;
            return (
              <li key={spec}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpec(spec);
                    setSelectedDoctor(null);
                  }}
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
      </div>

      {/* Colonna dottori + booking */}
      <div className="flex-1 flex gap-6">
        <div className="flex-1 bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold mb-3">
            Dottori del reparto
          </h2>

          {!selectedSpec ? (
            <p className="text-xs text-slate-500">
              Seleziona prima un reparto sulla sinistra.
            </p>
          ) : (
            <>
              {groupedBySpec[selectedSpec]?.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nessun dottore in questo reparto.
                </p>
              ) : (
                <ul className="space-y-2">
                  {groupedBySpec[selectedSpec].map((doc) => (
                    <li key={doc.id}>
                      <DoctorCard
                        doctor={doc}
                        onSelect={() => setSelectedDoctor(doc)}
                        selected={selectedDoctor?.id === doc.id}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="w-[420px]">
          {selectedDoctor ? (
            <BookingPanel
              doctor={selectedDoctor}
              onClose={() => setSelectedDoctor(null)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-4 text-xs text-slate-500">
              Seleziona un dottore per prenotare una visita.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onSelect, selected }) {
  const specKey = doctor.specialization;
  const spec = patientSpecializationLabels[specKey] || {};
  const titolo = spec.titolo || specKey || "";
  const reparto = spec.reparto || "";

  const days = Array.isArray(doctor.availabilityDays)
    ? doctor.availabilityDays
    : doctor.availabilityDays
    ? [doctor.availabilityDays]
    : [];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border rounded-lg px-3 py-2 text-left text-sm flex flex-col gap-1 ${
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="font-semibold text-slate-800">{doctor.name}</div>
      <div className="text-xs text-slate-600">
        {titolo && <span>{titolo}</span>}
        {reparto && <span className="ml-1 text-slate-500">· {reparto}</span>}
      </div>
      {days.length > 0 && (
        <div className="text-[11px] text-slate-500">
          Giorni: {days.map((d) => weekdayLabels[d] || d).join(", ")}
        </div>
      )}
      {doctor.availabilityShift && (
        <div className="text-[11px] text-slate-500">
          Orario:{" "}
          {doctor.availabilityShift === "MORNING"
            ? "Mattina (09:00 - 13:00)"
            : doctor.availabilityShift === "AFTERNOON"
            ? "Pomeriggio (14:00 - 18:00)"
            : "Giornata intera (09:00 - 18:00)"}
        </div>
      )}
    </button>
  );
}

// === BOOKING PANEL ===
function BookingPanel({ doctor, onClose }) {
  const { user } = useAuth();
  const [visitType, setVisitType] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [localBusyByDate, setLocalBusyByDate] = useState({});

  const specKey = doctor.specialization;
  const exams = examTypesBySpecialization[specKey] || [];

  const {
    data: doctorAppointments = [],
    isLoading: loadingSlots,
    refetch: refetchDoctorAppointments,
  } = useQuery({
    queryKey: ["doctorAppointmentsForBooking", doctor.id],
    queryFn: () => api(`/api/appointments/doctor/${doctor.id}`),
    enabled: !!doctor?.id,
  });

  const baseSlots = useMemo(() => {
    const morning = [9, 10, 11, 12];
    const afternoon = [14, 15, 16, 17];

    if (doctor.availabilityShift === "MORNING") return morning;
    if (doctor.availabilityShift === "AFTERNOON") return afternoon;
    return [...morning, ...afternoon];
  }, [doctor.availabilityShift]);

  const isWorkingDay = useMemo(() => {
    if (!selectedDate) return false;

    const d = new Date(selectedDate + "T00:00:00");
    const dayIndex = d.getDay();
    const code = weekdayCodes[dayIndex];

    const days = Array.isArray(doctor.availabilityDays)
      ? doctor.availabilityDays
      : doctor.availabilityDays
      ? [doctor.availabilityDays]
      : [];

    if (days.length === 0) return true;
    return days.includes(code);
  }, [selectedDate, doctor.availabilityDays]);

  // Slot occupati
  const busyHours = useMemo(() => {
    const set = new Set();
    if (!selectedDate) return set;

    (doctorAppointments || []).forEach((appt) => {
      if (!appt.dateTime) return;
      if (appt.status === "CANCELED") return;

      const dtStr = String(appt.dateTime);
      const apptDate = dtStr.slice(0, 10);
      if (apptDate !== selectedDate) return;

      const hourStr = dtStr.slice(11, 13);
      const hour = parseInt(hourStr, 10);
      if (!Number.isNaN(hour)) {
        set.add(hour);
      }
    });

    const localSet = localBusyByDate[selectedDate];
    if (localSet) {
      for (const h of localSet) {
        set.add(h);
      }
    }

    return set;
  }, [selectedDate, doctorAppointments, localBusyByDate]);

  const allDayBusy = useMemo(() => {
    if (!selectedDate || !isWorkingDay) return false;
    if (!baseSlots.length) return false;
    return baseSlots.every((h) => busyHours.has(h));
  }, [selectedDate, isWorkingDay, baseSlots, busyHours]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || selectedHour == null || !visitType) {
        throw new Error("Compila tutti i campi obbligatori.");
      }

      const isoDateTime = `${selectedDate}T${String(selectedHour).padStart(
        2,
        "0"
      )}:00:00`;

      const body = {
        doctorId: doctor.id,
        patientId: user?.patientId,
        dateTime: isoDateTime,
        reason: visitType,
        notes: notes || null,
      };

      return api("/api/appointments", {
        method: "POST",
        body,
      });
    },
    onSuccess: async () => {
      setLocalBusyByDate((prev) => {
        const prevSet = prev[selectedDate] || new Set();
        const newSet = new Set(prevSet);
        if (selectedHour != null) {
          newSet.add(selectedHour);
        }
        return {
          ...prev,
          [selectedDate]: newSet,
        };
      });

      setSubmitError("");
      setSubmitSuccess("Appuntamento prenotato con successo.");

      try {
        await refetchDoctorAppointments();
      } catch {
        //Gia gestito
      }
    },
    onError: (err) => {
      setSubmitSuccess("");

      let msg =
        err?.message ||
        "Errore nella prenotazione. Controlla i dati inseriti.";

      if (
        typeof msg === "string" &&
        msg.includes("Il dottore ha già un appuntamento in questa fascia oraria")
      ) {
        msg =
          "Questo orario non è più disponibile. Seleziona un altro slot libero.";
      }

      setSubmitError(msg);
    },
  });

  const canChooseSlots = selectedDate && isWorkingDay;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">
          Prenota visita con{" "}
          <span className="text-blue-700">{doctor.name}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <FiX />
          <span>Chiudi</span>
        </button>
      </div>

      {/* Tipo di visita */}
      <div className="mb-3">
        <label className="block text-xs mb-1">Tipo di visita*</label>
        {exams.length > 0 ? (
          <select
            className="w-full border rounded-lg px-2 py-1 text-sm"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
          >
            <option value="">Seleziona una visita</option>
            {exams.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="w-full border rounded-lg px-2 py-1 text-sm"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
            placeholder="Descrivi la visita che desideri"
          />
        )}
      </div>

      {/* Note */}
      <div className="mb-3">
        <label className="block text-xs mb-1">
          Note per il dottore (opzionale)
        </label>
        <textarea
          className="w-full border rounded-lg px-2 py-1 text-sm min-h-[70px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Es. sintomi principali, da quanto tempo, terapie in corso..."
        />
      </div>

      {/* Data */}
      <div className="mb-3">
        <label className="block text-xs mb-1">Data desiderata*</label>
        <input
          type="date"
          className="border rounded-lg px-2 py-1 text-sm w-full"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedHour(null);
            setSubmitError("");
            setSubmitSuccess("");
          }}
          min={todayStr}
        />
        {selectedDate && !isWorkingDay && (
          <p className="mt-1 text-[11px] text-red-600">
            Il dottore non lavora in questo giorno. Scegli un altro giorno.
          </p>
        )}
      </div>

      {/* Slot orari */}
      <div className="mb-4">
        <label className="block text-xs mb-1">Orario*</label>

        {loadingSlots && (
          <p className="text-xs text-slate-500">
            Caricamento disponibilità...
          </p>
        )}

        {!loadingSlots && (
          <>
            {!canChooseSlots ? (
              <p className="text-xs text-slate-500">
                Seleziona una data lavorativa per vedere gli orari
                disponibili.
              </p>
            ) : (
              <>
                {allDayBusy && (
                  <p className="text-[11px] text-red-600 mb-1">
                    Nessuno slot disponibile per questo giorno: il dottore ha
                    già tutti gli orari occupati.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {baseSlots.map((hour) => {
                    const label = `${String(hour).padStart(2, "0")}:00`;
                    const isBusy = busyHours.has(hour);
                    const disabled = isBusy || mutation.isPending;

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedHour(hour)}
                        className={`px-2 py-1 rounded-lg border text-xs ${
                          disabled
                            ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                            : selectedHour === hour
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {label}
                        {isBusy && (
                          <span className="ml-1 text-[10px] text-red-500">
                            occupato
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Errori / successo */}
      {submitError && (
        <div className="text-xs text-red-600 mb-2">{submitError}</div>
      )}
      {submitSuccess && (
        <div className="text-xs text-emerald-600 mb-2">
          {submitSuccess}
        </div>
      )}

      {/* Pulsante conferma */}
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={
          mutation.isPending ||
          !visitType ||
          !selectedDate ||
          selectedHour == null ||
          !isWorkingDay
        }
        className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
      >
        {mutation.isPending
          ? "Prenotazione in corso..."
          : "Conferma prenotazione"}
      </button>
    </div>
  );
}
