import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FiX } from "react-icons/fi";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { examTypesBySpecialization } from "../../../lib/patientConfig";

// Giorni settimana
const weekdayCodes = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function RescheduleModal({ appointment, doctor, onClose, onRescheduled }) {
  const { user } = useAuth();

  const initialDate = appointment.dateTime
    ? new Date(appointment.dateTime).toISOString().slice(0, 10)
    : "";

  const initialHour = appointment.dateTime
    ? new Date(appointment.dateTime).getHours()
    : null;

  const [visitType, setVisitType] = useState(appointment.reason || "");
  const [notes, setNotes] = useState(appointment.notes || "");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const specKey = doctor?.specialization;
  const exams = examTypesBySpecialization[specKey] || [];

  const {
    data: doctorAppointments = [],
    isLoading: loadingSlots,
  } = useQuery({
    queryKey: ["doctorAppointmentsForReschedule", doctor?.id],
    queryFn: () => api(`/api/appointments/doctor/${doctor.id}`),
    enabled: !!doctor?.id,
  });

  const baseSlots = useMemo(() => {
    const morning = [9, 10, 11, 12];
    const afternoon = [14, 15, 16, 17];

    if (doctor?.availabilityShift === "MORNING") return morning;
    if (doctor?.availabilityShift === "AFTERNOON") return afternoon;
    return [...morning, ...afternoon];
  }, [doctor?.availabilityShift]);

  const isWorkingDay = useMemo(() => {
    if (!selectedDate || !doctor) return false;

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
  }, [selectedDate, doctor]);

  const busyHours = useMemo(() => {
    const set = new Set();
    if (!selectedDate) return set;

    (doctorAppointments || []).forEach((appt) => {
      if (!appt.dateTime) return;
      if (appt.status === "CANCELED") return;

      const d = new Date(appt.dateTime);
      const apptDate = d.toISOString().slice(0, 10);
      const hour = d.getHours();

      if (appt.id === appointment.id) return;

      if (apptDate === selectedDate) {
        set.add(hour);
      }
    });

    return set;
  }, [selectedDate, doctorAppointments, appointment.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || selectedHour == null || !visitType) {
        throw new Error("Compila tutti i campi obbligatori.");
      }

      const isoDateTime = `${selectedDate}T${String(selectedHour).padStart(
        2,
        "0"
      )}:00:00`;

      //il paziente annulla il vecchio e crea un nuovo appuntamento
      await api(`/api/appointments/${appointment.id}/cancel`, {
        method: "PATCH",
      });

      const body = {
        doctorId: doctor.id,
        patientId: user?.patientId,
        dateTime: isoDateTime,
        reason: visitType,
        notes: notes || null,
      };

      //creato da paziente il backend lo mette in stato SENDED
      return api("/api/appointments", {
        method: "POST",
        body,
      });
    },
    onSuccess: () => {
      setSubmitError("");
      setSubmitSuccess("Appuntamento riprogrammato con successo.");
      if (onRescheduled) {
        onRescheduled();
      }
    },
    onError: (err) => {
      setSubmitSuccess("");
      setSubmitError(
        err?.message ||
          "Errore nella riprogrammazione. Controlla i dati inseriti."
      );
    },
  });

  const canChooseSlots = selectedDate && isWorkingDay;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 text-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base">Modifica appuntamento</h3>
            <p className="text-xs text-slate-500">
              {doctor ? `con ${doctor.name}` : "Dettagli appuntamento"}
            </p>
          </div>
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
          />
        </div>

        {/* Data */}
        <div className="mb-3">
          <label className="block text-xs mb-1">Nuova data*</label>
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
          <label className="block text-xs mb-1">Nuovo orario*</label>

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

        {/* Pulsanti azione */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border text-xs text-slate-600 hover:bg-slate-50"
          >
            Annulla
          </button>
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
            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {mutation.isPending
              ? "Salvataggio..."
              : "Conferma nuova data e ora"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
