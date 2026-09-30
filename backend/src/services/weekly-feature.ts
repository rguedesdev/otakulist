const FEATURE_TIME_ZONE = "America/Sao_Paulo";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function getLocalDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: FEATURE_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
}

export function getDailyRotation(date = new Date()) {
  const { day, month, year } = getLocalDateParts(date);
  const localDate = Date.UTC(year, month - 1, day);
  return Math.floor(localDate / DAY_IN_MILLISECONDS);
}

export function pickDailyItem<T>(items: readonly T[], date = new Date()): T | null {
  if (items.length === 0) return null;
  return items[getDailyRotation(date) % items.length] ?? null;
}
