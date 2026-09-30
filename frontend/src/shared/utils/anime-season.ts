const ANIME_SEASON_TIME_ZONE = "America/Sao_Paulo";

type AnimeSeasonKey = "winter" | "spring" | "summer" | "fall";

type AnimeSeason = {
  key: AnimeSeasonKey;
  label: string;
  name: "Inverno" | "Primavera" | "Verão" | "Outono";
  year: number;
};

const graphqlSeasonNames: Record<AnimeSeasonKey, "WINTER" | "SPRING" | "SUMMER" | "FALL"> = {
  winter: "WINTER",
  spring: "SPRING",
  summer: "SUMMER",
  fall: "FALL",
};

const seasonNames: Record<AnimeSeasonKey, AnimeSeason["name"]> = {
  winter: "Inverno",
  spring: "Primavera",
  summer: "Verão",
  fall: "Outono",
};

function createAnimeSeason(key: AnimeSeasonKey, year: number): AnimeSeason {
  const name = seasonNames[key];
  return { key, label: `${name} ${year}`, name, year };
}

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: ANIME_SEASON_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    day: values.day,
    month: values.month,
    year: values.year,
  };
}

function getAnimeSeason(date: Date): AnimeSeason {
  const { day, month, year } = getDateParts(date);
  const monthAndDay = month * 100 + day;

  // Os marcos são os das estações no Hemisfério Sul. Os nomes exibidos
  // são invertidos para representar a temporada de anime no Japão.
  let key: AnimeSeasonKey;

  if (monthAndDay >= 1222) {
    return createAnimeSeason("winter", year + 1);
  }

  if (monthAndDay < 321) {
    key = "winter";
  } else if (monthAndDay < 621) {
    key = "spring";
  } else if (monthAndDay < 923) {
    key = "summer";
  } else {
    key = "fall";
  }

  return createAnimeSeason(key, year);
}

function getNextAnimeSeason(season: AnimeSeason): AnimeSeason {
  if (season.key === "winter") return createAnimeSeason("spring", season.year);
  if (season.key === "spring") return createAnimeSeason("summer", season.year);
  if (season.key === "summer") return createAnimeSeason("fall", season.year);
  return createAnimeSeason("winter", season.year + 1);
}

function getPreviousAnimeSeason(season: AnimeSeason): AnimeSeason {
  if (season.key === "winter") return createAnimeSeason("fall", season.year - 1);
  if (season.key === "spring") return createAnimeSeason("winter", season.year);
  if (season.key === "summer") return createAnimeSeason("spring", season.year);
  return createAnimeSeason("summer", season.year);
}

function parseAnimeSeasonSlug(value: string | string[] | undefined): AnimeSeason | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(winter|spring|summer|fall)-(\d{4})$/);
  if (!match) return null;

  const key = match[1] as AnimeSeasonKey;
  const year = Number(match[2]);
  return year >= 1900 && year <= 3000 ? createAnimeSeason(key, year) : null;
}

function getGraphqlAnimeSeason(key: AnimeSeasonKey) {
  return graphqlSeasonNames[key];
}

export {
  getAnimeSeason,
  getGraphqlAnimeSeason,
  getNextAnimeSeason,
  getPreviousAnimeSeason,
  parseAnimeSeasonSlug,
};
export type { AnimeSeason, AnimeSeasonKey };
