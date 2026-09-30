import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";

import {
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import { LuBookHeart } from "react-icons/lu";
import { RiFireLine, RiQuillPenLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./lightnovel.module.css";
import { assetUrl } from "@/shared/auth/api";
import { MediaSearch } from "@/shared/components/MediaSearch/page";
import { PublicationFilters } from "@/shared/components/PublicationFilters/page";

type DailyLightNovelRecommendation = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  publisher: string | null;
  publisherEntity: { displayName: string } | null;
  source: string | null;
  genres: string[];
  reviewSummary: { average: number; count: number };
};

const dailyLightNovelRecommendationQuery = `query DailyLightNovelRecommendation($includeAdult: Boolean!) {
  dailyLightNovelRecommendation(includeAdult: $includeAdult) {
    id title slug synopsis coverUrl publisher source genres
    publisherEntity { displayName }
    reviewSummary { average count }
  }
}`;

type RecentPublishingLightNovel = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  status: string;
  volumes: number;
  genres: string[];
  publisher: string | null;
  publisherEntity: { displayName: string } | null;
  source: string | null;
  reviewSummary: { average: number; count: number };
};

type TrendingLightNovel = {
  title: string;
  slug: string;
  coverUrl: string;
  score: number;
  ratingCount: number;
};

const trendingLightNovelsQuery = `query TrendingLightNovels($includeAdult: Boolean!) {
  topRatedWorks(medium: LIGHT_NOVEL, limit: 5, includeAdult: $includeAdult) {
    title slug coverUrl score ratingCount
  }
}`;

async function getTrendingLightNovels(includeAdult: boolean): Promise<TrendingLightNovel[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trendingLightNovelsQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { topRatedWorks: TrendingLightNovel[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.topRatedWorks;
  } catch {
    return [];
  }
}

type BrowseLightNovel = RecentPublishingLightNovel & {
  status: string;
  startDate: string | null;
};

const browseLightNovelsQuery = `query BrowseLightNovels($includeAdult: Boolean!) {
  browseLightNovels(includeAdult: $includeAdult) {
    id title slug synopsis coverUrl volumes genres publisher source startDate status
    publisherEntity { displayName }
    reviewSummary { average count }
  }
}`;

async function getBrowseLightNovels(includeAdult: boolean): Promise<BrowseLightNovel[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: browseLightNovelsQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { browseLightNovels: BrowseLightNovel[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.browseLightNovels;
  } catch {
    return [];
  }
}

const recentPublishingLightNovelsQuery = `query RecentPublishingLightNovels($includeAdult: Boolean!) {
  recentPublishingLightNovels(limit: 20, includeAdult: $includeAdult) {
    id title slug synopsis coverUrl status volumes genres publisher source
    publisherEntity { displayName }
    reviewSummary { average count }
  }
}`;

async function getRecentPublishingLightNovels(includeAdult: boolean): Promise<RecentPublishingLightNovel[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: recentPublishingLightNovelsQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { recentPublishingLightNovels: RecentPublishingLightNovel[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.recentPublishingLightNovels;
  } catch {
    return [];
  }
}

async function getDailyLightNovelRecommendation(includeAdult: boolean) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: dailyLightNovelRecommendationQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json() as {
      data?: { dailyLightNovelRecommendation: DailyLightNovelRecommendation | null };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? null : body.data.dailyLightNovelRecommendation;
  } catch {
    return null;
  }
}

function formatCount(value: number, singular: string, plural: string) {
  if (value === 0) return `${plural} não listados`;
  return `${value} ${value === 1 ? singular : plural}`;
}

async function LightNovelPage({ searchParams }: {
  searchParams: Promise<{ status?: string | string[]; workStatus?: string | string[]; genre?: string | string[]; publisher?: string | string[]; source?: string | string[]; year?: string | string[] }>;
}) {
  await connection();
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const showReleaseFilters = status === "releasing";
  const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  const selectedStatus = firstValue(params.workStatus) ?? "PUBLISHING";
  const selectedGenre = firstValue(params.genre) ?? "";
  const selectedPublisher = firstValue(params.publisher) ?? "";
  const selectedSource = firstValue(params.source) ?? "";
  const selectedYear = firstValue(params.year) ?? "";
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const [spotlightNovel, publishingLightNovels, trendingLightNovels, browseLightNovels] = await Promise.all([
    getDailyLightNovelRecommendation(includeAdult),
    getRecentPublishingLightNovels(includeAdult),
    getTrendingLightNovels(includeAdult),
    showReleaseFilters ? getBrowseLightNovels(includeAdult) : Promise.resolve([] as BrowseLightNovel[]),
  ]);
  const filterOptions = {
    statuses: [...new Set(browseLightNovels.map((novel) => novel.status))].sort(),
    genres: [...new Set(browseLightNovels.flatMap((novel) => novel.genres))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    publishers: [...new Set(browseLightNovels.map((novel) => novel.publisherEntity?.displayName ?? novel.publisher).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    sources: [...new Set(browseLightNovels.map((novel) => novel.source).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    years: [...new Set(browseLightNovels.map((novel) => novel.startDate ? novel.startDate.slice(0, 4) : "").filter(Boolean))].sort((a, b) => b.localeCompare(a)),
  };
  const filteredLightNovels = browseLightNovels.filter((novel) =>
    (!selectedStatus || novel.status === selectedStatus)
    && (!selectedGenre || novel.genres.includes(selectedGenre))
    && (!selectedPublisher || (novel.publisherEntity?.displayName ?? novel.publisher) === selectedPublisher)
    && (!selectedSource || novel.source === selectedSource)
    && (!selectedYear || novel.startDate?.startsWith(selectedYear)),
  );
  const displayedLightNovels = showReleaseFilters ? filteredLightNovels : publishingLightNovels.slice(0, 5);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><LuBookHeart aria-hidden="true" />Descobrir light novels</span>
            <h1>Novos mundos, volume por volume</h1>
            <p>Explore séries em publicação, acompanhe volumes e encontre sua próxima leitura.</p>
          </div>
          <MediaSearch medium="LIGHT_NOVEL" label="Buscar light novel" placeholder="Buscar por título..." />
        </header>

        {showReleaseFilters && <PublicationFilters
          medium="light-novel"
          statuses={filterOptions.statuses}
          facets={[
            { key: "genre", label: "Gêneros", values: filterOptions.genres },
            { key: "publisher", label: "Editoras", values: filterOptions.publishers },
            { key: "source", label: "Origens", values: filterOptions.sources },
            { key: "year", label: "Ano", values: filterOptions.years },
          ]}
          selected={{ workStatus: selectedStatus, genre: selectedGenre, publisher: selectedPublisher, source: selectedSource, year: selectedYear }}
        />}

        {spotlightNovel && <section className={styles.spotlight} aria-labelledby="spotlight-title">
          <Image
            src={assetUrl(spotlightNovel.coverUrl) ?? spotlightNovel.coverUrl}
            alt={`Capa de ${spotlightNovel.title}`}
            fill
            sizes="(max-width: 760px) 100vw, 1280px"
            priority
            unoptimized
          />
          <div className={styles.spotlightShade} />
          <div className={styles.spotlightContent}>
            <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Recomendação do dia</span>
            <h2 id="spotlight-title">{spotlightNovel.title}</h2>
            <div className={styles.spotlightMeta}>
              <span>Light novel</span>
              <span>Nota acima de 6</span>
              {(spotlightNovel.publisherEntity?.displayName ?? spotlightNovel.publisher ?? spotlightNovel.source) && (
                <span>{spotlightNovel.publisherEntity?.displayName ?? spotlightNovel.publisher ?? spotlightNovel.source}</span>
              )}
              <strong>★ {spotlightNovel.reviewSummary.count > 0 ? spotlightNovel.reviewSummary.average.toFixed(1) : "—"}</strong>
            </div>
            <p>{spotlightNovel.synopsis}</p>
            <div className={styles.spotlightGenres}>{spotlightNovel.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
            <Link href={`/light-novel/${spotlightNovel.slug}`}>Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.spotlightAside}>
            <span>Avaliação da comunidade</span>
            <strong>★ {spotlightNovel.reviewSummary.average.toFixed(1)} / 10</strong>
            <small>{formatCount(spotlightNovel.reviewSummary.count, "avaliação", "avaliações")}</small>
          </div>
        </section>}

        <section className={styles.section} aria-labelledby="publishing-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>{showReleaseFilters ? "Catálogo publicado" : "Séries para acompanhar"}</span><h2 id="publishing-title">{showReleaseFilters ? "Resultados" : "Em publicação"}</h2></div>
          </div>

          <div className={styles.novelGrid}>
            {displayedLightNovels.map((novel) => {
              const publisher = novel.publisherEntity?.displayName ?? novel.publisher ?? novel.source;
              const score = novel.reviewSummary.count > 0 ? novel.reviewSummary.average.toFixed(1) : "—";

              return (
                <Link className={styles.novelCard} href={`/light-novel/${novel.slug}`} key={novel.id}>
                  <div className={styles.novelCover}>
                    <Image
                      src={assetUrl(novel.coverUrl) ?? novel.coverUrl}
                      alt={`Capa de ${novel.title}`}
                      fill
                      sizes="(max-width: 580px) 46vw, (max-width: 980px) 30vw, 220px"
                      unoptimized
                    />
                    <span className={styles.cardScore}>★ {score}</span>
                    <span className={styles.publishingBadge}><span />{novel.status === "PUBLISHING" ? "Publicando" : novel.status === "FINISHED" ? "Completa" : novel.status}</span>
                  </div>
                  <div className={styles.novelInfo}>
                    <h3>{novel.title}</h3>
                    <p>Light novel<span>•</span>{novel.volumes > 0 ? `${novel.volumes} ${novel.volumes === 1 ? "volume" : "volumes"}` : "Volumes não informados"}</p>
                    <div className={styles.cardGenres}>{novel.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
                    {publisher && <small><RiQuillPenLine aria-hidden="true" />{publisher}</small>}
                  </div>
                </Link>
              );
            })}
            {displayedLightNovels.length === 0 && (
              <p className={styles.emptyPublishing}>{showReleaseFilters ? "Nenhuma light novel corresponde aos filtros selecionados." : "Nenhuma light novel em publicação cadastrada."}</p>
            )}
          </div>
          <Link className={styles.sectionAction} href="/light-novel?status=releasing">Ver todas em publicação <FiArrowRight aria-hidden="true" /></Link>
        </section>

        <div className={styles.middleGrid}>
          <section className={styles.trendingPanel} aria-labelledby="trending-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Comunidade</span><h2 id="trending-title">Trending agora</h2></div>
              <RiFireLine aria-hidden="true" />
            </div>
            <ol>
              {trendingLightNovels.map((novel, index) => (
                <li key={novel.slug}>
                  <Link href={`/light-novel/${novel.slug}`}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <Image src={assetUrl(novel.coverUrl) ?? novel.coverUrl} alt={`Capa de ${novel.title}`} width={42} height={58} unoptimized />
                    <span className={styles.rankTitle}><strong>{novel.title}</strong><small>★ {novel.score.toFixed(1)} · {novel.ratingCount} avaliações</small></span>
                  </Link>
                </li>
              ))}
              {trendingLightNovels.length === 0 && (
                <li className={styles.emptyList}>Ainda não há avaliações suficientes para o ranking.</li>
              )}
            </ol>
            <Link className={styles.sectionAction} href="/ranking/light-novel">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

        <section className={styles.upcomingPanel} aria-labelledby="upcoming-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Próximas leituras</span><h2 id="upcoming-title">Volumes em destaque</h2></div>
            <Link className={styles.headingLink} href="/light-novel?release=upcoming">Ver calendário <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.upcomingGrid}>
            {publishingLightNovels.slice(0, 3).map((novel) => {
              const publisher = novel.publisherEntity?.displayName ?? novel.publisher ?? novel.source ?? "Editora não informada";
              const nextVolume = novel.volumes + 1;

              return (
                <Link className={styles.upcomingCard} href={`/light-novel/${novel.slug}`} key={novel.id}>
                  <Image src={assetUrl(novel.coverUrl) ?? novel.coverUrl} alt={`Capa de ${novel.title}`} width={104} height={144} unoptimized />
                  <div>
                    <span className={styles.releaseDate}><FiCalendar aria-hidden="true" />Data de lançamento não informada</span>
                    <h3>{novel.title} — Volume {nextVolume}</h3>
                    <small>{publisher}</small>
                    <p>{novel.synopsis}</p>
                  </div>
                  <FiArrowRight className={styles.cardArrow} aria-hidden="true" />
                </Link>
              );
            })}
            {publishingLightNovels.length === 0 && (
              <p className={styles.emptyUpcoming}>Nenhum próximo volume disponível no catálogo.</p>
            )}
          </div>
        </section>
        </div>


      </div>
    </main>
  );
}

export default LightNovelPage;
