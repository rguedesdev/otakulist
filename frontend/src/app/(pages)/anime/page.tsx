import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";

import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiTv,
} from "react-icons/fi";
import { RiFireLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./anime.module.css";
import { AnimeSeasonFilters } from "./AnimeSeasonFilters";
import { AnimeBroadcastCalendar, type AnimeBroadcastItem } from "./AnimeBroadcastCalendar";
import { SeasonalAnimeSection } from "./SeasonalAnimeSection";
import { assetUrl } from "@/shared/auth/api";
import { MediaSearch } from "@/shared/components/MediaSearch/page";
import { animeReleaseFormatLabels, type AnimeReleaseFormat } from "@/shared/types/entities";
import {
  getAnimeSeason,
  getGraphqlAnimeSeason,
  parseAnimeSeasonSlug,
} from "@/shared/utils/anime-season";

type SeasonalAnime = {
  anime: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    synopsis: string;
    genres: string[];
    reviewSummary?: { average: number; count: number };
  };
  installment: {
    id: string;
    label: string;
    coverUrl: string | null;
    episodes: number;
    format: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
    broadcastDay: AnimeBroadcastItem["day"] | null;
    broadcastTime: string | null;
    startDate: string | null;
    endDate: string | null;
    status: "ANNOUNCED" | "AIRING" | "FINISHED" | "CANCELLED";
  };
};

type RankedAnime = {
  title: string;
  slug: string;
  coverUrl: string;
  score: number;
  ratingCount: number;
};

const animePageQuery = `query AnimePage($season: AnimeSeason!, $year: Int!, $limit: Int, $includeAdult: Boolean!) {
  seasonalAnime(season: $season, year: $year, limit: $limit, includeAdult: $includeAdult) {
    anime { id title slug coverUrl genres reviewSummary { average count } }
    installment { id label coverUrl episodes format startDate endDate status broadcastDay broadcastTime }
  }
  seasonSchedule: seasonalAnime(season: $season, year: $year, includeAdult: $includeAdult, deduplicate: false) {
    anime { id title slug coverUrl synopsis genres reviewSummary { average count } }
    installment { id label coverUrl episodes format startDate endDate status broadcastDay broadcastTime }
  }
  trendingAnime: topRatedWorks(medium: ANIME, limit: 5, includeAdult: $includeAdult) {
    title slug coverUrl score ratingCount
  }
}`;

const animeStatusLabels: Record<SeasonalAnime["installment"]["status"], string> = {
  ANNOUNCED: "Anunciado",
  AIRING: "Em exibição",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

const animeBroadcastDayLabels: Record<AnimeBroadcastItem["day"], string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
};

async function getSeasonalAnime(
  season: ReturnType<typeof getAnimeSeason>,
  includeAdult: boolean,
  limit: number | null,
) {
  const emptyContent = { items: [], schedule: [], trending: [] as RankedAnime[] };
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: animePageQuery,
        variables: {
          season: getGraphqlAnimeSeason(season.key),
          year: season.year,
          limit,
          includeAdult,
        },
      }),
      cache: "no-store",
    });
    if (!response.ok) return emptyContent;
    const body = await response.json() as {
      data?: {
        seasonalAnime: SeasonalAnime[];
        seasonSchedule: SeasonalAnime[];
        trendingAnime: RankedAnime[];
      };
      errors?: Array<{ message: string }>;
    };
    if (body.errors || !body.data) return emptyContent;
    return {
      items: body.data.seasonalAnime,
      schedule: body.data.seasonSchedule,
      trending: body.data.trendingAnime,
    };
  } catch {
    return emptyContent;
  }
}

function formatEpisodeCount(episodes: number) {
  if (episodes === 0) return "Não Listado";
  return `${episodes} ${episodes === 1 ? "episódio" : "episódios"}`;
}

function formatReleaseDate(value: string | null) {
  if (!value) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function currentDateInJapan() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDateKey(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function currentWeekInJapan(today: string) {
  const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  const start = shiftDateKey(today, -weekday);
  return { start, end: shiftDateKey(start, 7) };
}

function isBroadcastWeekEligible(
  installment: SeasonalAnime["installment"],
  today: string,
  weekStart: string,
  weekEnd: string,
) {
  if (installment.status === "CANCELLED" || installment.status === "FINISHED") return false;
  const startDate = installment.startDate?.slice(0, 10);
  const endDate = installment.endDate?.slice(0, 10);
  if (endDate && endDate < today) return false;
  if (!startDate) return installment.status !== "ANNOUNCED";
  return startDate <= today || (startDate >= weekStart && startDate < weekEnd);
}

function shuffleItems<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex]!, shuffled[index]!];
  }
  return shuffled;
}

const animeFormats = ["TV", "MOVIE", "OVA"] as const;
const animeFilterStatuses = ["AIRING", "ANNOUNCED"] as const;

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{
    season?: string | string[];
    format?: string | string[];
    status?: string | string[];
    genre?: string | string[];
  }>;
}) {
  await connection();
  const now = new Date();
  const currentSeason = getAnimeSeason(now);
  const params = await searchParams;
  const requestedSeason = parseAnimeSeasonSlug(params.season);
  const selectedSeason = requestedSeason ?? currentSeason;
  const showAllSeasonAnime = requestedSeason !== null;
  const requestedFormat = firstSearchParam(params.format)?.toUpperCase();
  const requestedStatus = firstSearchParam(params.status)?.toUpperCase();
  const selectedFormat = showAllSeasonAnime ? animeFormats.find((format) => format === requestedFormat) ?? null : null;
  const selectedStatus = showAllSeasonAnime ? animeFilterStatuses.find((status) => status === requestedStatus) ?? null : null;
  const requestedGenre = firstSearchParam(params.genre)?.trim() || null;
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const {
    items: seasonAnime,
    schedule: scheduleAnime,
    trending: trendingAnime,
  } = await getSeasonalAnime(
    selectedSeason,
    includeAdult,
    showAllSeasonAnime ? null : 5,
  );
  const todayInJapan = currentDateInJapan();
  const broadcastWeek = currentWeekInJapan(todayInJapan);
  const broadcastItems: AnimeBroadcastItem[] = scheduleAnime.flatMap(({ anime, installment }) =>
    installment.format === "TV"
      && installment.broadcastDay
      && installment.broadcastTime
      && isBroadcastWeekEligible(installment, todayInJapan, broadcastWeek.start, broadcastWeek.end)
      ? [{
        id: `${anime.id}-${installment.id}`,
        title: anime.title,
        slug: anime.slug,
        image: assetUrl(installment.coverUrl ?? anime.coverUrl) ?? anime.coverUrl,
        day: installment.broadcastDay,
        time: installment.broadcastTime,
        detail: `${animeStatusLabels[installment.status]} · ${formatEpisodeCount(installment.episodes)}`,
      }]
      : [],
  );
  const spotlightAnime = shuffleItems(
    scheduleAnime
      .filter(({ installment }) => installment.status !== "CANCELLED")
      .filter((item, index, items) => (
        items.findIndex((candidate) => candidate.anime.id === item.anime.id) === index
      )),
  )[0] ?? null;
  const seasonGenres = [...new Set(seasonAnime.flatMap(({ anime }) => anime.genres))]
    .sort((left, right) => left.localeCompare(right, "pt-BR"));
  const selectedGenre = showAllSeasonAnime
    ? seasonGenres.find((genre) => genre === requestedGenre) ?? null
    : null;
  const filteredSeasonAnime = seasonAnime.filter(({ anime, installment }) => (
    (!selectedFormat || installment.format === selectedFormat)
    && (!selectedStatus || installment.status === selectedStatus)
    && (!selectedGenre || anime.genres.includes(selectedGenre))
  ));
  const hasActiveFilters = Boolean(selectedFormat || selectedStatus || selectedGenre);
  const filterKey = [
    selectedSeason.key, selectedSeason.year, selectedFormat, selectedStatus, selectedGenre,
  ].filter(Boolean).join("-");

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><FiTv aria-hidden="true" />Descobrir anime</span>
            <h1>Encontre sua próxima história</h1>
            <p>Explore a temporada, acompanhe o que está em alta e veja o que estreia em breve.</p>
          </div>
          <MediaSearch medium="ANIME" label="Buscar anime" placeholder="Buscar por título..." />
        </header>

        {showAllSeasonAnime && <AnimeSeasonFilters
          genres={seasonGenres}
          selectedFormat={selectedFormat}
          selectedStatus={selectedStatus}
          selectedGenre={selectedGenre}
        />}

        {spotlightAnime && (() => {
          const { anime, installment } = spotlightAnime;
          const image = assetUrl(installment.coverUrl ?? anime.coverUrl) ?? anime.coverUrl;
          const releaseFormat = installment.format.toLowerCase() as AnimeReleaseFormat;
          const score = anime.reviewSummary && anime.reviewSummary.count > 0
            ? anime.reviewSummary.average.toFixed(1)
            : "—";
          const broadcastDay = installment.broadcastDay
            ? animeBroadcastDayLabels[installment.broadcastDay]
            : null;

          return <section className={styles.spotlight} aria-labelledby="spotlight-title">
            <Image
              src={image}
              alt={`Capa de ${anime.title}`}
              fill
              sizes="(max-width: 760px) 100vw, 1280px"
              priority
              unoptimized
            />
            <div className={styles.spotlightShade} />
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Destaque de {selectedSeason.label}</span>
              <h2 id="spotlight-title">{anime.title}</h2>
              <div className={styles.spotlightMeta}>
                <span>{animeReleaseFormatLabels[releaseFormat]}</span>
                <span>{formatEpisodeCount(installment.episodes)}</span>
                {broadcastDay && <span>{broadcastDay}</span>}
                <strong>★ {score}</strong>
              </div>
              <p>{anime.synopsis}</p>
              <div className={styles.spotlightGenres}>{anime.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
              <Link href={`/anime/${anime.slug}`}>Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
            </div>
            {broadcastDay && installment.broadcastTime ? (
              <div className={styles.spotlightAside}>
                <span>Transmissão semanal</span>
                <strong>{broadcastDay} às {installment.broadcastTime}</strong>
                <small><FiClock aria-hidden="true" />Horário JST</small>
              </div>
            ) : installment.startDate ? (
              <div className={styles.spotlightAside}>
                <span>Data de estreia</span>
                <strong>{formatReleaseDate(installment.startDate)}</strong>
                <small><FiCalendar aria-hidden="true" />{animeStatusLabels[installment.status]}</small>
              </div>
            ) : null}
          </section>;
        })()}

        <SeasonalAnimeSection
          key={filterKey}
          initialSeason={selectedSeason}
          initialItems={filteredSeasonAnime}
          includeAdult={includeAdult}
          expanded={showAllSeasonAnime}
          hasActiveFilters={hasActiveFilters}
        />

        <div className={styles.middleGrid}>
          <section className={styles.trendingPanel} aria-labelledby="trending-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Comunidade</span><h2 id="trending-title">Trending agora</h2></div>
              <RiFireLine aria-hidden="true" />
            </div>
            <ol>
              {trendingAnime.map((anime, index) => (
                <li key={anime.slug}>
                  <Link href={`/anime/${anime.slug}`}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <Image src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt="" width={42} height={58} unoptimized />
                    <span className={styles.rankTitle}>
                      <strong>{anime.title}</strong>
                      <small>★ {anime.score.toFixed(1)} · {anime.ratingCount} {anime.ratingCount === 1 ? "avaliação" : "avaliações"}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {trendingAnime.length === 0 && (
              <p className={styles.emptyRanking}>O ranking aparecerá quando a comunidade avaliar os animes.</p>
            )}
            <Link className={styles.sectionAction} href="/ranking/anime">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

          <AnimeBroadcastCalendar items={broadcastItems} />
        </div>
      </div>
    </main>
  );
}

export default AnimePage;
