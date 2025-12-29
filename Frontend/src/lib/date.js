// src/utils/dateFormat.js

export function formatDateTimeRome(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);

  const dateFormatter = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}
