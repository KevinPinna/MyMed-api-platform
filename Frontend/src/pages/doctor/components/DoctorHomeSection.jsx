import React from "react";

export default function DoctorHomeSection({ doctor, specLabel }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-semibold mb-2">
        Benvenuto, {doctor?.name}
      </h1>

      {specLabel && (
        <p className="text-sm text-slate-600 mb-4">
          Specializzazione: {specLabel}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Agenda</h3>
          <p className="text-slate-500">
            Visualizza gli appuntamenti in programma, completa le visite e
            compila i referti.
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Pazienti</h3>
          <p className="text-slate-500">
            Accedi alla cartella clinica dei pazienti che hai già visitato e
            consulta i referti salvati.
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Disponibilità</h3>
          <p className="text-slate-500">
            Imposta i giorni e le fasce orarie in cui sei disponibile per le
            prenotazioni dei pazienti.
          </p>
        </div>
      </div>
    </div>
  );
}
