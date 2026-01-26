import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";

const weekdayCodes = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function DoctorRescheduleModal({
  appointment,
  doctor,
  onClose,
  onRescheduled,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);

  const { data: doctorAppointments = [] } = useQuery({
    queryKey: ["doctorAppointmentsReschedule", doctor.id],
    queryFn: () => api(`/api/appointments/doctor/${doctor.id}`),
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
    const code = weekdayCodes[d.getDay()];

    const days = Array.isArray(doctor.availabilityDays)
      ? doctor.availabilityDays
      : doctor.availabilityDays
      ? [doctor.availabilityDays]
      : [];

    return days.length === 0 || days.includes(code);
  }, [selectedDate, doctor]);

  const busyHours = useMemo(() => {
    const set = new Set();

    doctorAppointments.forEach((a) => {
      if (!a.dateTime || a.status === "CANCELED") return;

      const d = new Date(a.dateTime);
      if (d.toISOString().slice(0, 10) === selectedDate) {
        set.add(d.getHours());
      }
    });

    return set;
  }, [selectedDate, doctorAppointments]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || selectedHour == null) {
        throw new Error("Compila data e orario");
      }

      const iso = `${selectedDate}T${String(selectedHour).padStart(
        2,
        "0"
      )}:00:00`;

      await api(`/api/appointments/${appointment.id}/doctor-reschedule`, {
        method: "PATCH",
        body: { dateTime: iso },
      });
    },
    onSuccess: () => {
      onRescheduled?.();
      onClose();
    },
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-3 sm:p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg text-sm max-h-[90vh] overflow-auto">
        <h3 className="font-semibold mb-2">Riprogramma appuntamento</h3>

        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedHour(null);
          }}
          className="border rounded px-2 py-1 w-full mb-2"
        />

        {selectedDate && isWorkingDay && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {baseSlots.map((h) => {
              const busy = busyHours.has(h);
              return (
                <button
                  key={h}
                  type="button"
                  disabled={busy}
                  onClick={() => setSelectedHour(h)}
                  className={`px-2 py-1 rounded border text-xs ${
                    busy
                      ? "bg-slate-100 text-slate-400"
                      : selectedHour === h
                      ? "border-blue-600 bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {String(h).padStart(2, "0")}:00
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded w-full sm:w-auto"
          >
            Annulla
          </button>

          <button
            onClick={() => mutation.mutate()}
            className="px-3 py-1 bg-blue-600 text-white rounded w-full sm:w-auto"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
