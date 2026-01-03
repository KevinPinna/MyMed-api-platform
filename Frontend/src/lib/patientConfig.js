// === LABELS SPECIALIZZAZIONI / REPARTI IN ITALIANO ===
export const patientSpecializationLabels = {
  CARDIOLOGY: { reparto: "Cardiologia", titolo: "Cardiologo" },
  DERMATOLOGY: { reparto: "Dermatologia", titolo: "Dermatologo" },
  ENDOCRINOLOGY: { reparto: "Endocrinologia", titolo: "Endocrinologo" },
  GASTROENTEROLOGY: {
    reparto: "Gastroenterologia",
    titolo: "Gastroenterologo",
  },
  NEUROLOGY: { reparto: "Neurologia", titolo: "Neurologo" },
  ORTHOPEDICS: { reparto: "Ortopedia", titolo: "Ortopedico" },
  PEDIATRICS: { reparto: "Pediatria", titolo: "Pediatra" },
  PSYCHIATRY: { reparto: "Psichiatria", titolo: "Psichiatra" },
  RADIOLOGY: { reparto: "Radiologia", titolo: "Radiologo" },
  GENERAL_PRACTICE: {
    reparto: "Medicina generale",
    titolo: "Medico di base",
  },
};

export const specializationLabels = patientSpecializationLabels;

// Tipi di visita consigliati per reparto
export const examTypesBySpecialization = {
  CARDIOLOGY: [
    "Visita cardiologica",
    "ECG",
    "Ecocardiogramma",
    "Controllo pressione",
  ],
  DERMATOLOGY: [
    "Visita dermatologica",
    "Controllo nei",
    "Valutazione dermatite",
  ],
  ENDOCRINOLOGY: [
    "Visita endocrinologica",
    "Controllo tiroide",
    "Controllo diabete",
  ],
  GASTROENTEROLOGY: [
    "Visita gastroenterologica",
    "Controllo reflusso",
    "Dolore addominale",
  ],
  NEUROLOGY: ["Visita neurologica", "Cefalea", "Capogiri"],
  ORTHOPEDICS: ["Visita ortopedica", "Dolore articolare", "Trauma"],
  PEDIATRICS: [
    "Visita pediatrica",
    "Controllo crescita",
    "Febbre ricorrente",
  ],
  PSYCHIATRY: [
    "Visita psichiatrica",
    "Disturbi d'ansia",
    "Disturbi del sonno",
  ],
  RADIOLOGY: ["Radiografia", "Ecografia", "TC (TAC)"],
  GENERAL_PRACTICE: [
    "Visita di base",
    "Controllo generale",
    "Certificato medico",
  ],
};

export const weekdayCodes = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const weekdayLabels = {
  MONDAY: "Lunedì",
  TUESDAY: "Martedì",
  WEDNESDAY: "Mercoledì",
  THURSDAY: "Giovedì",
  FRIDAY: "Venerdì",
  SATURDAY: "Sabato",
  SUNDAY: "Domenica",
};

export const statusLabels = {
  SENDED: "In attesa conferma dottore",
  BOOKED: "Prenotato",
  CANCELED: "Annullato",
  COMPLETED: "Completato",
  PENDING_PATIENT: "In attesa tua conferma",
};
