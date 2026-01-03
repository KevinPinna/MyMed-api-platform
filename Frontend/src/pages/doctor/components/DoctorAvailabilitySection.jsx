import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { weekdayCodes, weekdayLabels } from "../../../lib/weekdays";

function DoctorAvailabilitySection({ doctor }) {
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState(() => {
    if (!doctor?.availabilityDays) return [];
    return Array.isArray(doctor.availabilityDays)
      ? doctor.availabilityDays
      : [doctor.availabilityDays];
  });

  const [shift, setShift] = useState(doctor?.availabilityShift || "FULL_DAY");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ availabilityDays, availabilityShift }) => {
      return api(`/api/doctors/${doctor.id}`, {
        method: "PATCH",
        body: {
          availabilityDays,
          availabilityShift,
        },
      });
    },
    onSuccess: () => {
      setErrorMsg("");
      setMessage("Disponibilità aggiornata con successo.");
      queryClient.invalidateQueries({ queryKey: ["doctor", doctor.id] });
    },
    onError: (err) => {
      setMessage("");
      setErrorMsg(
        err?.message || "Errore durante l'aggiornamento della disponibilità."
      );
    },
  });

  function toggleDay(code) {
    setSelectedDays((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    updateAvailabilityMutation.mutate({
      availabilityDays: selectedDays,
      availabilityShift: shift,
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">Impostazione disponibilità</h2>
      <p className="text-sm text-slate-600 mb-4">
        Indica in quali giorni e fasce orarie sei disponibile per le
        prenotazioni dei pazienti.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Giorni disponibili */}
        <div>
          <label className="block text-xs font-semibold mb-2">
            Giorni in cui lavori
          </label>
          <p className="text-xs text-slate-500 mb-2">
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
              Nessun giorno selezionato: i pazienti non potranno prenotare
              appuntamenti.
            </p>
          )}
        </div>

        {/* Fascia oraria */}
        <div>
          <label className="block text-xs font-semibold mb-2">
            Fascia oraria di lavoro
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Questa impostazione viene usata per generare gli slot disponibili
            (mattino/pomeriggio/giornata intera).
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
                <div className="text-[11px] text-slate-500">09:00 - 13:00</div>
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
                <div className="text-[11px] text-slate-500">14:00 - 18:00</div>
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
                <div className="text-[11px] text-slate-500">09:00 - 18:00</div>
              </div>
            </label>
          </div>
        </div>

        {/* Messaggi */}
        {errorMsg && (
          <div className="text-xs text-red-600">{errorMsg}</div>
        )}
        {message && (
          <div className="text-xs text-emerald-600">{message}</div>
        )}

        {/* Pulsante salva */}
        <div className="pt-2 border-t mt-3">
          <button
            type="submit"
            disabled={updateAvailabilityMutation.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {updateAvailabilityMutation.isPending
              ? "Salvataggio..."
              : "Salva disponibilità"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorAvailabilitySection;
