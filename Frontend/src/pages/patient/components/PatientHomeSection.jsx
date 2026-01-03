import React from "react";

export default function PatientHomeSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-semibold mb-2">Benvenuto in MyMed</h1>
      <p className="text-sm text-slate-600 mb-4">
        Da qui puoi prenotare visite, consultare i tuoi appuntamenti e
        ricevere notifiche dalla clinica.
      </p>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Reparti</h3>
          <p className="text-slate-500">
            Sfoglia i reparti della clinica e prenota la visita con il
            dottore più adatto alle tue necessità.
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Appuntamenti</h3>
          <p className="text-slate-500">
            Controlla gli appuntamenti futuri, annulla le visite che non
            puoi più effettuare o riprogrammale.
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-1">Comunicazioni</h3>
          <p className="text-slate-500">
            Tramite la campanella riceverai notifiche su eventuali
            spostamenti o cancellazioni da parte della clinica.
          </p>
        </div>
      </div>
    </div>
  );
}
