"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowRight, FiCalendar } from "react-icons/fi";

import styles from "./anime.module.css";
import { assetUrl } from "@/shared/auth/api";
import { animeReleaseFormatLabels, type AnimeReleaseFormat } from "@/shared/types/entities";
import { getNextAnimeSeason, getPreviousAnimeSeason, type AnimeSeason } from "@/shared/utils/anime-season";

type SeasonalAnimeItem = {
  anime: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    genres: string[];
    reviewSummary?: { average: number; count: number };
  };
  installment: {
    id: string;
    label: string;
    coverUrl: string | null;
    episodes: number;
    format: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
    startDate: string | null;
    status: "ANNOUNCED" | "AIRING" | "FINISHED" | "CANCELLED";
  };
};

const query = `query SeasonalAnimeCards($season: AnimeSeason!, $year: Int!, $limit: Int, $includeAdult: Boolean!) {
  seasonalAnime(season: $season, year: $year, limit: $limit, includeAdult: $includeAdult) {
    anime { id title slug coverUrl genres reviewSummary { average count } }
    installment { id label coverUrl episodes format startDate status }
  }
}`;

const graphqlSeasonNames = {
  winter: "WINTER",
  spring: "SPRING",
  summer: "SUMMER",
  fall: "FALL",
} as const;

const statusLabels: Record<SeasonalAnimeItem["installment"]["status"], string> = {
  ANNOUNCED: "Anunciado",
  AIRING: "Em exibição",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

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

export function SeasonalAnimeSection({
  initialSeason,
  initialItems,
  includeAdult,
  expanded,
  hasActiveFilters = false,
}: {
  initialSeason: AnimeSeason;
  initialItems: SeasonalAnimeItem[];
  includeAdult: boolean;
  expanded: boolean;
  hasActiveFilters?: boolean;
}) {
  const router = useRouter();
  const [season, setSeason] = useState(initialSeason);
  const [items, setItems] = useState(initialItems);
  const [changing, setChanging] = useState(false);

  const changeSeason = async (nextSeason: AnimeSeason) => {
    if (changing) return;
    if (expanded) {
      setChanging(true);
      const params = new URLSearchParams(window.location.search);
      params.set("season", `${nextSeason.key}-${nextSeason.year}`);
      router.push(`/anime?${params.toString()}`, { scroll: false });
      return;
    }

    setChanging(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: {
            season: graphqlSeasonNames[nextSeason.key],
            year: nextSeason.year,
            limit: expanded ? null : 5,
            includeAdult,
          },
        }),
      });
      const body = await response.json() as {
        data?: { seasonalAnime: SeasonalAnimeItem[] };
        errors?: Array<{ message: string }>;
      };
      if (!response.ok || body.errors || !body.data) throw new Error("Não foi possível carregar a temporada.");

      setSeason(nextSeason);
      setItems(body.data.seasonalAnime);
      window.setTimeout(() => setChanging(false), 40);
    } catch {
      setChanging(false);
    }
  };

  const previousSeason = getPreviousAnimeSeason(season);
  const nextSeason = getNextAnimeSeason(season);

  return (
    <section className={styles.section} aria-labelledby="season-title" aria-busy={changing}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.sectionKicker}>{season.label}</span>
          <h2 id="season-title">{expanded ? "Todos os animes da temporada" : "Animes da temporada"}</h2>
        </div>
        <div className={styles.seasonControls}>
          <button
            type="button"
            disabled={changing}
            aria-label={`Ver ${previousSeason.label}`}
            title={`Ver ${previousSeason.label}`}
            onClick={() => void changeSeason(previousSeason)}
          >‹</button>
          <strong>{season.label}</strong>
          <button
            type="button"
            disabled={changing}
            aria-label={`Ver ${nextSeason.label}`}
            title={`Ver ${nextSeason.label}`}
            onClick={() => void changeSeason(nextSeason)}
          >›</button>
        </div>
      </div>

      <div className={`${styles.seasonGridTransition} ${changing ? styles.seasonGridChanging : ""}`}>
        <div className={`${styles.animeGrid} ${expanded ? styles.animeGridExpanded : ""}`}>
          {items.map(({ anime, installment }) => {
            const releaseFormat = installment.format.toLowerCase() as AnimeReleaseFormat;
            const image = assetUrl(installment.coverUrl ?? anime.coverUrl) ?? anime.coverUrl;
            const score = anime.reviewSummary && anime.reviewSummary.count > 0
              ? anime.reviewSummary.average.toFixed(1)
              : "—";

            return (
              <Link className={styles.animeCard} href={`/anime/${anime.slug}`} key={anime.id}>
                <div className={styles.animeCover}>
                  <Image src={image} alt={`Capa de ${anime.title}`} fill sizes="(max-width: 580px) 46vw, (max-width: 980px) 30vw, 220px" unoptimized />
                  <span className={styles.cardScore}>★ {score}</span>
                  <span className={styles.airingBadge}><span />{statusLabels[installment.status]}</span>
                </div>
                <div className={styles.animeInfo}>
                  <h3>{anime.title}</h3>
                  <p>
                    {animeReleaseFormatLabels[releaseFormat]}<span>•</span>
                    {installment.label}<span>•</span>
                    {formatEpisodeCount(installment.episodes)}
                  </p>
                  <div className={styles.cardGenres}>{anime.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
                  <small><FiCalendar aria-hidden="true" />{formatReleaseDate(installment.startDate)}</small>
                </div>
              </Link>
            );
          })}
          {items.length === 0 && hasActiveFilters ? (
            <p className={styles.emptySeason}>Nenhum anime corresponde aos filtros selecionados.</p>
          ) : items.length === 0 && (
            <p className={styles.emptySeason}>Nenhum anime publicado foi encontrado para {season.label}.</p>
          )}
        </div>
      </div>

      {!expanded && items.length > 0 && (
        <Link className={styles.sectionAction} href={`/anime?season=${season.key}-${season.year}`}>Ver todos da temporada <FiArrowRight aria-hidden="true" /></Link>
      )}
    </section>
  );
}

export type { SeasonalAnimeItem };
