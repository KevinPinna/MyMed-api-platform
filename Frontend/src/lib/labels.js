export const SPECIALIZATION_META = {
  CARDIOLOGY: { dept: "Cardiologia", role: "Cardiologo" },
  DERMATOLOGY: { dept: "Dermatologia", role: "Dermatologo" },
  ENDOCRINOLOGY: { dept: "Endocrinologia", role: "Endocrinologo" },
  GASTROENTEROLOGY: { dept: "Gastroenterologia", role: "Gastroenterologo" },
  NEUROLOGY: { dept: "Neurologia", role: "Neurologo" },
  ORTHOPEDICS: { dept: "Ortopedia", role: "Ortopedico" },
  PEDIATRICS: { dept: "Pediatria", role: "Pediatra" },
  PSYCHIATRY: { dept: "Psichiatria", role: "Psichiatra" },
  RADIOLOGY: { dept: "Radiologia", role: "Radiologo" },
  GENERAL_PRACTICE: { dept: "Medicina generale", role: "Medico di base" },
};

export function specializationToRoleIt(specCode) {
  if (!specCode) return "N/D";
  return SPECIALIZATION_META[specCode]?.role || specCode;
}

export function specializationToDeptIt(specCode) {
  if (!specCode) return "N/D";
  return SPECIALIZATION_META[specCode]?.dept || specCode;
}

export const DEPARTMENT_OPTIONS = Object.entries(SPECIALIZATION_META).map(
  ([value, meta]) => ({
    value,
    label: meta.dept,
    roleLabel: meta.role,
  })
);

export const DAY_LABEL_IT = {
  MONDAY: "Lunedì",
  TUESDAY: "Martedì",
  WEDNESDAY: "Mercoledì",
  THURSDAY: "Giovedì",
  FRIDAY: "Venerdì",
  SATURDAY: "Sabato",
  SUNDAY: "Domenica",
};

export const SHIFT_LABEL_IT = {
  MORNING: "Mattina",
  AFTERNOON: "Pomeriggio",
  FULL_DAY: "Tutto il giorno",
};

export function dayToItalian(dayCode) {
  if (!dayCode) return "N/D";
  return DAY_LABEL_IT[dayCode] || dayCode;
}

export function shiftToItalian(shiftCode) {
  if (!shiftCode) return "N/D";
  return SHIFT_LABEL_IT[shiftCode] || shiftCode;
}
