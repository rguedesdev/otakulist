const siteMonths = [
  "Jan", "Fev", "Mar", "Abril", "Maio", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatSiteDate(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;

  const dateOnlyMatch = typeof value === "string" ? dateOnlyPattern.exec(value) : null;
  const date = value instanceof Date
    ? value
    : new Date(dateOnlyMatch ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) return fallback;

  if (dateOnlyMatch) {
    const month = siteMonths[Number(dateOnlyMatch[2]) - 1];
    if (!month) return fallback;
    return `${Number(dateOnlyMatch[3])} ${month} ${dateOnlyMatch[1]}`;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const month = siteMonths[Number(part("month")) - 1];
  const day = part("day");
  const year = part("year");
  return month && day && year ? `${Number(day)} ${month} ${year}` : fallback;
}
