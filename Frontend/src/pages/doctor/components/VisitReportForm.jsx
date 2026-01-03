import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { formatDateTimeRome } from "../../../lib/date";

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

// Helper per evitare "Visita di controllo - Visita di controllo - ..."
function buildFollowUpReason(previousReason) {
  if (!previousReason || !previousReason.trim()) {
    return "Visita di controllo";
  }

  const cleaned = previousReason
    .replace(/Visita di controllo\s*-\s*/gi, "")
    .trim();

  return cleaned ? `Visita di controllo - ${cleaned}` : "Visita di controllo";
}

export default function VisitReportForm({ appointment, doctorId, doctor }) {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // stato per visita di controllo
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Referto esistente se esiste
  const {
    data: existingReport,
    isLoading: loadingReport,
    isError: errorReport,
  } = useQuery({
    queryKey: ["visit-report", appointment.id],
    queryFn: () => api(`/api/visit-reports/appointment/${appointment.id}`),
  });

  // Appuntamenti del dottore per controllare gli slot occupati
  const {
    data: doctorAppointments = [],
    isLoading: loadingSlots,
  } = useQuery({
    queryKey: ["doctorAppointmentsForFollowUp", doctorId],
    queryFn: () => api(`/api/appointments/doctor/${doctorId}`),
    enabled: !!doctorId,
  });

  // Orari base in base al turno
  const baseSlots = useMemo(() => {
    const morning = [9, 10, 11, 12];
    const afternoon = [14, 15, 16, 17];
    if (!doctor) return [...morning, ...afternoon];
    if (doctor.availabilityShift === "MORNING") return morning;
    if (doctor.availabilityShift === "AFTERNOON") return afternoon;
    return [...morning, ...afternoon];
  }, [doctor?.availabilityShift]);

  // Giorni lavorativi del dottore
  const isWorkingDay = useMemo(() => {
    if (!followUpDate || !doctor) return false;
    const d = new Date(followUpDate + "T00:00:00");
    const dayIndex = d.getDay();
    const code = weekdayCodes[dayIndex];

    const days = Array.isArray(doctor.availabilityDays)
      ? doctor.availabilityDays
      : doctor.availabilityDays
      ? [doctor.availabilityDays]
      : [];

    if (days.length === 0) return true; // se non configurati tutti i giorni sono validi
    return days.includes(code);
  }, [followUpDate, doctor]);

  // Slot occupati in quel giorno
  const busyHours = useMemo(() => {
    const set = new Set();
    if (!followUpDate) return set;

    (doctorAppointments || []).forEach((appt) => {
      if (!appt.dateTime) return;
      if (appt.status === "CANCELED") return;
      const d = new Date(appt.dateTime);
      const apptDate = d.toISOString().slice(0, 10);
      const hour = d.getHours();
      if (apptDate === followUpDate) {
        set.add(hour);
      }
    });

    return set;
  }, [followUpDate, doctorAppointments]);

  const canChooseSlots = followUpDate && isWorkingDay;

  const saveReportMutation = useMutation({
    mutationFn: async (payload) => {
      await api("/api/visit-reports", {
        method: "POST",
        body: payload,
      });
    },
    onError: () => {
      setErrorMessage("Errore nel salvataggio del referto.");
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    const formData = new FormData(e.target);
    const anamnesis = formData.get("anamnesis") || "";
    const objectiveDiagnosis = formData.get("objectiveDiagnosis") || "";
    const therapy = formData.get("therapy") || "";

    try {
      //Salvo / aggiorno il referto
      await saveReportMutation.mutateAsync({
        doctorId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        anamnesis,
        objectiveDiagnosis,
        therapy,
      });

      //Se il dottore ha spuntato "visita di controllo", crea anche un nuovo appuntamento
      if (scheduleFollowUp) {
        if (!followUpDate || selectedHour == null) {
          setErrorMessage(
            "Per programmare la visita di controllo devi selezionare data e orario disponibili."
          );
          return;
        }

        const isoDateTime = `${followUpDate}T${String(selectedHour).padStart(
          2,
          "0"
        )}:00:00`;

        const reasonBase = buildFollowUpReason(appointment.reason);

        await api("/api/appointments", {
          method: "POST",
          body: {
            doctorId,
            patientId: appointment.patientId,
            dateTime: isoDateTime,
            reason: reasonBase,
            notes: null,
          },
        });

        setMessage(
          "Referto salvato e visita di controllo programmata correttamente."
        );
      } else {
        setMessage("Referto salvato correttamente.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err?.message ||
          "Errore durante il salvataggio del referto o della visita di controllo."
      );
    }
  }

  return (
    <>
      <h3 className="text-md font-semibold mb-2">
        Referto per visita del {formatDateTimeRome(appointment.dateTime)}
      </h3>

      {loadingReport && (
        <p className="text-xs text-slate-500">
          Caricamento eventuale referto esistente...
        </p>
      )}
      {errorReport && (
        <p className="text-xs text-slate-500">
          Nessun referto esistente (puoi crearne uno nuovo).
        </p>
      )}

      <form
        className="space-y-3 text-sm flex-1 flex flex-col"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-xs mb-1">
            Anamnesi patologica (allergie, anemie, sindromi...)
          </label>
          <textarea
            name="anamnesis"
            defaultValue={existingReport?.anamnesis || ""}
            rows={4}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Diagnosi obiettiva</label>
          <textarea
            name="objectiveDiagnosis"
            defaultValue={existingReport?.objectiveDiagnosis || ""}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Terapia / Prescrizioni</label>
          <textarea
            name="therapy"
            defaultValue={existingReport?.therapy || ""}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Sezione visita di controllo */}
        <div className="pt-3 mt-2 border-t">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              className="rounded"
              checked={scheduleFollowUp}
              onChange={(e) => {
                setScheduleFollowUp(e.target.checked);
                if (!e.target.checked) {
                  setFollowUpDate("");
                  setSelectedHour(null);
                  setErrorMessage("");
                }
              }}
            />
            <span>Programma una visita di controllo per questo paziente</span>
          </label>

          {scheduleFollowUp && (
            <>
              <div className="mt-2">
                <label className="block text-xs mb-1">
                  Data visita di controllo
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    setSelectedHour(null);
                    setErrorMessage("");
                  }}
                  min={todayStr}
                />
                {followUpDate && !isWorkingDay && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Non risulti disponibile in questo giorno. Scegli un altro
                    giorno.
                  </p>
                )}
              </div>

              <div className="mt-3">
                <label className="block text-xs mb-1">Orario</label>
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
                          const disabled =
                            isBusy || saveReportMutation.isPending;

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

              <p className="mt-1 text-[11px] text-slate-500">
                L&apos;appuntamento verrà creato per lo stesso paziente e lo
                stesso dottore, e comparirà nella sezione Appuntamenti del
                paziente.
              </p>
            </>
          )}
        </div>

        {/* Messaggi di errore / successo */}
        {errorMessage && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
        {message && !errorMessage && (
          <p className="text-xs text-emerald-600">{message}</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
            disabled={saveReportMutation.isPending}
          >
            {saveReportMutation.isPending ? "Salvataggio..." : "Salva referto"}
          </button>
        </div>
      </form>
    </>
  );
}
