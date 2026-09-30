import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { RiFireLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./manga.module.css";
import { assetUrl } from "@/shared/auth/api";
import { MediaSearch } from "@/shared/components/MediaSearch/page";
import { PublicationFilters } from "@/shared/components/PublicationFilters/page";

type DailyMangaRecommendation = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  magazine: string | null;
  magazineEntity: { title: string } | null;
  serialization: string | null;
  genres: string[];
  reviewSummary: { average: number; count: number };
};

type RecentPublishingManga = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  status: string;
  volumes: number;
  publisher: string | null;
  genres: string[];
  createdAt: string;
  reviewSummary: { average: number; count: number };
};

type BrowseManga = RecentPublishingManga & {
  status: string;
  demography: string | null;
  magazine: string | null;
  magazineEntity: { title: string } | null;
  startDate: string | null;
};

type TrendingManga = {
  title: string;
  slug: string;
  coverUrl: string;
  score: number;
  ratingCount: number;
};

const recentPublishingMangasQuery = `query RecentPublishingMangas($includeAdult: Boolean!) {
  recentPublishingMangas(limit: 20, includeAdult: $includeAdult) {
    id title slug synopsis coverUrl status volumes publisher genres createdAt reviewSummary { average count }
  }
}`;

async function getRecentPublishingMangas(includeAdult: boolean): Promise<RecentPublishingManga[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: recentPublishingMangasQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { recentPublishingMangas: RecentPublishingManga[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.recentPublishingMangas;
  } catch {
    return [];
  }
}

const browseMangasQuery = `query BrowseMangas($includeAdult: Boolean!) {
  browseMangas(includeAdult: $includeAdult) {
    id title slug synopsis coverUrl volumes publisher genres createdAt demography magazine startDate status
    magazineEntity { title }
    reviewSummary { average count }
  }
}`;

async function getBrowseMangas(includeAdult: boolean): Promise<BrowseManga[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: browseMangasQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { browseMangas: BrowseManga[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.browseMangas;
  } catch {
    return [];
  }
}

const trendingMangaQuery = `query TrendingManga($includeAdult: Boolean!) {
  topRatedWorks(medium: MANGA, limit: 5, includeAdult: $includeAdult) {
    title slug coverUrl score ratingCount
  }
}`;

async function getTrendingManga(includeAdult: boolean): Promise<TrendingManga[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trendingMangaQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as {
      data?: { topRatedWorks: TrendingManga[] };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? [] : body.data.topRatedWorks;
  } catch {
    return [];
  }
}

const dailyMangaRecommendationQuery = `query DailyMangaRecommendation($includeAdult: Boolean!) {
  dailyMangaRecommendation(includeAdult: $includeAdult) {
    id title slug synopsis coverUrl magazine serialization genres
    magazineEntity { title }
    reviewSummary { average count }
  }
}`;

async function getDailyMangaRecommendation(includeAdult: boolean): Promise<DailyMangaRecommendation | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: dailyMangaRecommendationQuery, variables: { includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json() as {
      data?: { dailyMangaRecommendation: DailyMangaRecommendation | null };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data ? null : body.data.dailyMangaRecommendation;
  } catch {
    return null;
  }
}

function formatCount(value: number, singular: string, plural: string) {
  if (value === 0) return `${plural} não listados`;
  return `${value} ${value === 1 ? singular : plural}`;
}

async function MangaPage({ searchParams }: {
  searchParams: Promise<{ status?: string | string[]; workStatus?: string | string[]; demography?: string | string[]; genre?: string | string[]; magazine?: string | string[] }>;
}) {
  await connection();
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const showReleaseFilters = status === "releasing";
  const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  const selectedStatus = firstValue(params.workStatus) ?? "PUBLISHING";
  const selectedDemography = firstValue(params.demography) ?? "";
  const selectedGenre = firstValue(params.genre) ?? "";
  const selectedMagazine = firstValue(params.magazine) ?? "";
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const [dailyRecommendation, recentMangas, trendingMangas, browseMangas] = await Promise.all([
    getDailyMangaRecommendation(includeAdult),
    getRecentPublishingMangas(includeAdult),
    getTrendingManga(includeAdult),
    showReleaseFilters ? getBrowseMangas(includeAdult) : Promise.resolve([] as BrowseManga[]),
  ]);
  const filterOptions = {
    statuses: [...new Set(browseMangas.map((manga) => manga.status))].sort(),
    demographies: [...new Set(browseMangas.map((manga) => manga.demography).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    genres: [...new Set(browseMangas.flatMap((manga) => manga.genres))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    magazines: [...new Set(browseMangas.map((manga) => manga.magazineEntity?.title ?? manga.magazine).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
  const filteredMangas = browseMangas.filter((manga) =>
    (!selectedStatus || manga.status === selectedStatus)
    && (!selectedDemography || manga.demography === selectedDemography)
    && (!selectedGenre || manga.genres.includes(selectedGenre))
    && (!selectedMagazine || (manga.magazineEntity?.title ?? manga.magazine) === selectedMagazine),
  );
  const displayedMangas = showReleaseFilters ? filteredMangas : recentMangas.slice(0, 5);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><GiEvilBook aria-hidden="true" />Descobrir manga</span>
            <h1>Histórias para a próxima leitura</h1>
            <p>Explore mangas em publicação, acompanhe suas leituras e descubra os próximos volumes.</p>
          </div>
          <MediaSearch medium="MANGA" label="Buscar manga" placeholder="Buscar por título..." />
        </header>

        {showReleaseFilters && <PublicationFilters
          medium="manga"
          statuses={filterOptions.statuses}
          facets={[
            { key: "demography", label: "Demografia", values: filterOptions.demographies },
            { key: "genre", label: "Gêneros", values: filterOptions.genres },
            { key: "magazine", label: "Revistas", values: filterOptions.magazines },
          ]}
          selected={{ workStatus: selectedStatus, demography: selectedDemography, genre: selectedGenre, magazine: selectedMagazine }}
        />}

        {dailyRecommendation && <section className={styles.spotlight} aria-labelledby="spotlight-title">
          <Image
            src={assetUrl(dailyRecommendation.coverUrl) ?? dailyRecommendation.coverUrl}
            alt={`Capa de ${dailyRecommendation.title}`}
            fill
            sizes="(max-width: 760px) 100vw, 1280px"
            priority
            unoptimized
          />
          <div className={styles.spotlightShade} />
          <div className={styles.spotlightContent}>
            <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Recomendação do dia</span>
            <h2 id="spotlight-title">{dailyRecommendation.title}</h2>
            <div className={styles.spotlightMeta}>
              <span>Manga</span>
              <span>Nota acima de 6</span>
              {(dailyRecommendation.magazineEntity?.title ?? dailyRecommendation.magazine ?? dailyRecommendation.serialization) && (
                <span>{dailyRecommendation.magazineEntity?.title ?? dailyRecommendation.magazine ?? dailyRecommendation.serialization}</span>
              )}
              <strong>★ {dailyRecommendation.reviewSummary.count > 0 ? dailyRecommendation.reviewSummary.average.toFixed(1) : "—"}</strong>
            </div>
            <p>{dailyRecommendation.synopsis}</p>
            <div className={styles.spotlightGenres}>{dailyRecommendation.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
            <Link href={`/manga/${dailyRecommendation.slug}`}>Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.spotlightAside}>
            <span>Avaliação da comunidade</span>
            <strong>★ {dailyRecommendation.reviewSummary.average.toFixed(1)} / 10</strong>
            <small>{formatCount(dailyRecommendation.reviewSummary.count, "avaliação", "avaliações")}</small>
          </div>
        </section>}

        <section className={styles.section} aria-labelledby="publishing-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>{showReleaseFilters ? "Catálogo publicado" : "Adicionados recentemente"}</span><h2 id="publishing-title">{showReleaseFilters ? "Resultados" : "Em publicação"}</h2></div>
          </div>
          <div className={styles.mangaGrid}>
            {displayedMangas.map((manga) => (
              <Link className={styles.mangaCard} href={`/manga/${manga.slug}`} key={manga.id}>
                <div className={styles.mangaCover}>
                  <Image src={assetUrl(manga.coverUrl) ?? manga.coverUrl} alt={`Capa de ${manga.title}`} fill sizes="(max-width: 580px) 46vw, (max-width: 980px) 30vw, 220px" unoptimized />
                  <span className={styles.cardScore}>★ {manga.reviewSummary.count > 0 ? manga.reviewSummary.average.toFixed(1) : "—"}</span>
                  <span className={styles.publishingBadge}><span />{manga.status === "PUBLISHING" ? "Em publicação" : manga.status === "FINISHED" ? "Completo" : manga.status === "HIATUS" ? "Em hiato" : manga.status}</span>
                </div>
                <div className={styles.mangaInfo}>
                  <h3>{manga.title}</h3>
                  <p>Adicionado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(manga.createdAt))}</p>
                  <div className={styles.cardGenres}>{manga.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div>
                </div>
              </Link>
            ))}
            {displayedMangas.length === 0 && <p className={styles.emptyPublishing}>{showReleaseFilters ? "Nenhum manga corresponde aos filtros selecionados." : "Nenhum manga em publicação cadastrado recentemente."}</p>}
          </div>
          <Link className={styles.sectionAction} href="/manga?status=releasing">Ver todos em publicação <FiArrowRight aria-hidden="true" /></Link>
        </section>

        <div className={styles.middleGrid}>
          <section className={styles.trendingPanel} aria-labelledby="trending-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Comunidade</span><h2 id="trending-title">Trending agora</h2></div>
              <RiFireLine aria-hidden="true" />
            </div>
            <ol>
              {trendingMangas.map((manga, index) => (
                <li key={manga.slug}>
                  <Link href={`/manga/${manga.slug}`}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <Image src={assetUrl(manga.coverUrl) ?? manga.coverUrl} alt={`Capa de ${manga.title}`} width={42} height={58} unoptimized />
                    <span className={styles.rankTitle}><strong>{manga.title}</strong><small>★ {manga.score.toFixed(1)} · {manga.ratingCount} avaliações</small></span>
                  </Link>
                </li>
              ))}
              {trendingMangas.length === 0 && <li className={styles.emptyList}>Ainda não há avaliações suficientes para o ranking.</li>}
            </ol>
            <Link className={styles.sectionAction} href="/ranking/manga">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

          <section className={styles.upcomingPanel} aria-labelledby="upcoming-title">
            <div className={styles.sectionHeading}>
              <div><span className={styles.sectionKicker}>Calendário editorial</span><h2 id="upcoming-title">Próximos volumes</h2></div>
              <Link className={styles.headingLink} href="/manga?release=upcoming">Ver calendário <FiArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.upcomingGrid}>
              {recentMangas.slice(0, 3).map((manga) => (
                <Link className={styles.upcomingCard} href={`/manga/${manga.slug}`} key={manga.id}>
                  <Image src={assetUrl(manga.coverUrl) ?? manga.coverUrl} alt={`Capa de ${manga.title}`} width={104} height={144} unoptimized />
                  <div>
                    <span className={styles.releaseDate}><FiCalendar aria-hidden="true" />Data não informada</span>
                    <h3>{manga.title} — Volume {manga.volumes + 1}</h3>
                    <small>{manga.publisher ?? "Editora não informada"}</small>
                    <p>{manga.synopsis}</p>
                  </div>
                  <FiArrowRight className={styles.cardArrow} aria-hidden="true" />
                </Link>
              ))}
              {recentMangas.length === 0 && <p className={styles.emptyUpcoming}>Nenhum próximo volume disponível no catálogo.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default MangaPage;
