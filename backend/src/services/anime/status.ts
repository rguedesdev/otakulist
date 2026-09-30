export const ANIME_STATUSES = ["ANNOUNCED", "AIRING", "FINISHED", "CANCELLED"] as const;

export type AnimeStatus = (typeof ANIME_STATUSES)[number];

type StatusInstallment = {
  status?: AnimeStatus | null;
  statusOverride?: AnimeStatus | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getTokyoDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getAnimeStatusOverride(installment: StatusInstallment): AnimeStatus | null {
  if (installment.statusOverride) return installment.statusOverride;
  if (installment.status === "CANCELLED") return "CANCELLED";
  if (!installment.startDate && installment.status && installment.status !== "ANNOUNCED") {
    return installment.status;
  }
  if (!installment.endDate && installment.status === "FINISHED") return "FINISHED";
  return null;
}

export function getEffectiveAnimeStatus(installment: StatusInstallment, now = new Date()): AnimeStatus {
  const statusOverride = getAnimeStatusOverride(installment);
  if (statusOverride) return statusOverride;

  const today = getTokyoDateKey(now);
  if (!installment.startDate || dateKey(installment.startDate) > today) return "ANNOUNCED";
  if (installment.endDate && dateKey(installment.endDate) < today) return "FINISHED";
  return "AIRING";
}

export function getOverallAnimeStatus(installments: StatusInstallment[], now = new Date()): AnimeStatus {
  const statuses = installments.map((item) => getEffectiveAnimeStatus(item, now));
  if (statuses.includes("AIRING")) return "AIRING";
  if (statuses.includes("ANNOUNCED")) return "ANNOUNCED";
  if (statuses.includes("FINISHED")) return "FINISHED";
  if (statuses.includes("CANCELLED")) return "CANCELLED";
  return "ANNOUNCED";
}
