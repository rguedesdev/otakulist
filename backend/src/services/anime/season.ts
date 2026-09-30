export const ANIME_SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export type AnimeSeason = (typeof ANIME_SEASONS)[number];

type SeasonValue = {
  season: AnimeSeason;
  year: number;
};

type SeasonalInstallment = {
  broadcastSeason?: string | null;
  startDate?: Date | null;
};

const seasonAliases: Record<AnimeSeason, string[]> = {
  WINTER: ["inverno", "winter"],
  SPRING: ["primavera", "spring"],
  SUMMER: ["verao", "summer"],
  FALL: ["outono", "fall", "autumn"],
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function parseBroadcastSeason(value: string | null | undefined): SeasonValue | null {
  if (!value) return null;
  const match = normalizeText(value).match(/^(inverno|winter|primavera|spring|verao|summer|outono|fall|autumn)\s+(?:de\s+)?(\d{4})$/);
  if (!match) return null;

  const alias = match[1];
  const year = Number(match[2]);
  const season = ANIME_SEASONS.find((item) => seasonAliases[item].includes(alias ?? ""));
  return season ? { season, year } : null;
}

export function getAnimeSeasonFromDate(date: Date): SeasonValue {
  const year = date.getUTCFullYear();
  const monthAndDay = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();

  if (monthAndDay >= 1222) return { season: "WINTER", year: year + 1 };
  if (monthAndDay < 321) return { season: "WINTER", year };
  if (monthAndDay < 621) return { season: "SPRING", year };
  if (monthAndDay < 923) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export function getInstallmentSeason(installment: SeasonalInstallment): SeasonValue | null {
  return parseBroadcastSeason(installment.broadcastSeason)
    ?? (installment.startDate ? getAnimeSeasonFromDate(installment.startDate) : null);
}

export function installmentMatchesSeason(
  installment: SeasonalInstallment,
  season: AnimeSeason,
  year: number,
) {
  const value = getInstallmentSeason(installment);
  return value?.season === season && value.year === year;
}

export function getAnimeSeasonDateRanges(season: AnimeSeason, year: number) {
  const utc = (month: number, day: number, targetYear = year) =>
    new Date(Date.UTC(targetYear, month - 1, day));

  switch (season) {
    case "WINTER":
      return [{ start: utc(12, 22, year - 1), end: utc(3, 21) }];
    case "SPRING":
      return [{ start: utc(3, 21), end: utc(6, 21) }];
    case "SUMMER":
      return [{ start: utc(6, 21), end: utc(9, 23) }];
    case "FALL":
      return [{ start: utc(9, 23), end: utc(12, 22) }];
  }
}

export function getBroadcastSeasonPattern(season: AnimeSeason, year: number) {
  const aliases: Record<AnimeSeason, string> = {
    WINTER: "(?:inverno|winter)",
    SPRING: "(?:primavera|spring)",
    SUMMER: "(?:ver[aã]o|summer)",
    FALL: "(?:outono|fall|autumn)",
  };
  return new RegExp(`^\\s*${aliases[season]}\\s+(?:de\\s+)?${year}\\s*$`, "i");
}
