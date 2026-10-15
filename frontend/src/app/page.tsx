import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

import { FiArrowRight, FiCalendar, FiCompass, FiPlay } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiBookmark3Line, RiSparkling2Line } from "react-icons/ri";

import styles from "./home.module.css";
import { assetUrl } from "@/shared/auth/api";
import { animeReleaseFormatLabels, type AnimeReleaseFormat } from "@/shared/types/entities";
import { getAnimeSeason, getGraphqlAnimeSeason, type AnimeSeason } from "@/shared/utils/anime-season";

type HomeWorkMedium = "ANIME" | "MANGA" | "LIGHT_NOVEL";

type TopRatedWork = {
  title: string;
  slug: string;
  medium: HomeWorkMedium;
  coverUrl: string;
  score: number;
  ratingCount: number;
};

type DiscoveryWork = {
  title: string;
  slug: string;
  medium: HomeWorkMedium;
  coverUrl: string;
  description: string;
};

type FeaturedAnime = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  installments: Array<{
    status: "ANNOUNCED" | "AIRING" | "FINISHED" | "CANCELLED";
  }>;
  reviewSummary: { average: number; count: number };
};

type SeasonalHomeAnime = {
  anime: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    reviewSummary?: { average: number; count: number };
  };
  installment: {
    id: string;
    format: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
    status: "ANNOUNCED" | "AIRING" | "FINISHED" | "CANCELLED";
    coverUrl: string | null;
  };
};

const homeContentQuery = `query HomeContent($season: AnimeSeason!, $year: Int!, $includeAdult: Boolean!) {
  dailyFeaturedAnime(includeAdult: $includeAdult) {
    id title slug synopsis coverUrl
    installments { status }
    reviewSummary { average count }
  }
  seasonalAnime(season: $season, year: $year, includeAdult: $includeAdult) {
    anime { id title slug coverUrl reviewSummary { average count } }
    installment { id format status coverUrl }
  }
  topRatedWorks(includeAdult: $includeAdult) { title slug medium coverUrl score ratingCount }
  discoveryWorks(includeAdult: $includeAdult) { title slug medium coverUrl description }
}`;

const rankingMediumLabels: Record<TopRatedWork["medium"], string> = {
  ANIME: "Anime",
  MANGA: "Manga",
  LIGHT_NOVEL: "Light Novel",
};

const discoveryConfig = {
  ANIME: { label: "Anime para maratonar", icon: FiPlay },
  MANGA: { label: "Manga em destaque", icon: GiEvilBook },
  LIGHT_NOVEL: { label: "Light novel para conhecer", icon: LuBookHeart },
} satisfies Record<HomeWorkMedium, { label: string; icon: typeof FiPlay }>;

const animeStatusLabels: Record<SeasonalHomeAnime["installment"]["status"], string> = {
  ANNOUNCED: "Anunciado",
  AIRING: "Em exibição",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

function workHref(item: { medium: HomeWorkMedium; slug: string }) {
  const segment = item.medium === "LIGHT_NOVEL" ? "light-novel" : item.medium.toLowerCase();
  return `/${segment}/${item.slug}`;
}

function getFeaturedAnimeStatus(anime: FeaturedAnime) {
  const status = (["AIRING", "ANNOUNCED", "FINISHED", "CANCELLED"] as const)
    .find((candidate) => anime.installments.some((installment) => installment.status === candidate));

  return animeStatusLabels[status ?? "ANNOUNCED"];
}

function rankSeasonalAnime(items: SeasonalHomeAnime[]) {
  return [...items]
    .sort((left, right) => {
      const leftReviews = left.anime.reviewSummary?.count ?? 0;
      const rightReviews = right.anime.reviewSummary?.count ?? 0;
      const leftScore = leftReviews > 0 ? (left.anime.reviewSummary?.average ?? 0) : -1;
      const rightScore = rightReviews > 0 ? (right.anime.reviewSummary?.average ?? 0) : -1;

      return rightScore - leftScore
        || rightReviews - leftReviews
        || left.anime.title.localeCompare(right.anime.title, "pt-BR");
    })
    .slice(0, 5);
}

async function getHomeContent(includeAdult: boolean, season: AnimeSeason) {
  const emptyContent = {
    featured: null as FeaturedAnime | null,
    trending: [] as SeasonalHomeAnime[],
    ranking: [] as TopRatedWork[],
    discovery: [] as DiscoveryWork[],
  };
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: homeContentQuery,
        variables: {
          season: getGraphqlAnimeSeason(season.key),
          year: season.year,
          includeAdult,
        },
      }),
      cache: "no-store",
    });
    if (!response.ok) return emptyContent;
    const body = await response.json() as {
      data?: {
        dailyFeaturedAnime: FeaturedAnime | null;
        seasonalAnime: SeasonalHomeAnime[];
        topRatedWorks: TopRatedWork[];
        discoveryWorks: DiscoveryWork[];
      };
      errors?: Array<{ message: string }>;
    };
    return body.errors || !body.data
      ? emptyContent
      : {
          featured: body.data.dailyFeaturedAnime,
          trending: rankSeasonalAnime(body.data.seasonalAnime),
          ranking: body.data.topRatedWorks,
          discovery: body.data.discoveryWorks,
        };
  } catch {
    return emptyContent;
  }
}

async function HomePage() {
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const currentSeason = getAnimeSeason(new Date());
  const { featured, trending, ranking, discovery } = await getHomeContent(includeAdult, currentSeason);
  const featuredHref = featured ? `/anime/${featured.slug}` : "/anime";
  const featuredScore = featured && featured.reviewSummary.count > 0
    ? `★ ${featured.reviewSummary.average.toFixed(1)}`
    : "Sem avaliações";

  return (
    <main className={styles.page}>
      <div className={styles.homeContainer}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              <RiSparkling2Line aria-hidden="true" />
              Seu universo otaku, organizado
            </span>
            <h1 id="home-title">
              Descubra histórias.
              <span>Acompanhe cada episódio.</span>
            </h1>
            <p>
              Encontre novos títulos, organize o que está assistindo e mantenha
              seu progresso em um só lugar.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={featuredHref}>
                Ver escolha do dia
                <FiArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.secondaryAction} href="/anime">
                <RiBookmark3Line aria-hidden="true" />
                Explorar catálogo
              </Link>
            </div>
          </div>

          {featured ? (
            <Link className={styles.featured} href={featuredHref}>
              <Image
                src={assetUrl(featured.coverUrl) ?? featured.coverUrl}
                alt={`Capa de ${featured.title}`}
                fill
                sizes="(max-width: 820px) 100vw, 44vw"
                priority
                unoptimized
              />
              <div className={styles.featuredShade} />
              <div className={styles.featuredTopline}>
                <span>Escolha do dia</span>
                <strong>{featuredScore}</strong>
              </div>
              <div className={styles.featuredInfo}>
                <span>Anime • {getFeaturedAnimeStatus(featured)}</span>
                <h2>{featured.title}</h2>
                <p>{featured.synopsis}</p>
              </div>
            </Link>
          ) : (
            <div className={`${styles.featured} ${styles.featuredFallback}`}>
              <div className={styles.featuredInfo}>
                <span>Escolha do dia</span>
                <h2>Novos destaques em breve</h2>
                <p>Publique animes no catálogo para ativar a seleção diária.</p>
              </div>
            </div>
          )}
        </section>

        <div className={styles.valueStrip} aria-label="Recursos do OtakuList">
          <div>
            <RiBookmark3Line aria-hidden="true" />
            <span><strong>Organize</strong> sua biblioteca</span>
          </div>
          <div>
            <FiCalendar aria-hidden="true" />
            <span><strong>Acompanhe</strong> cada lançamento</span>
          </div>
          <div>
            <FiCompass aria-hidden="true" />
            <span><strong>Descubra</strong> novos favoritos</span>
          </div>
        </div>

        <section className={styles.section} aria-labelledby="trending-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>Temporada atual · {currentSeason.label}</span>
              <h2 id="trending-title">Em alta agora</h2>
            </div>
            <Link href={`/anime?season=${currentSeason.key}-${currentSeason.year}`}>
              Ver temporada
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.trendingGrid}>
            {trending.map(({ anime, installment }, index) => {
              const reviewCount = anime.reviewSummary?.count ?? 0;
              const score = reviewCount > 0 ? anime.reviewSummary?.average.toFixed(1) : "—";
              const releaseFormat = installment.format.toLowerCase() as AnimeReleaseFormat;
              const coverUrl = installment.coverUrl ?? anime.coverUrl;

              return (
                <Link className={styles.mediaCard} href={`/anime/${anime.slug}`} key={anime.id}>
                  <div className={styles.mediaCover}>
                    <Image
                      src={assetUrl(coverUrl) ?? coverUrl}
                      alt={`Capa de ${anime.title}`}
                      fill
                      sizes="(max-width: 560px) 46vw, (max-width: 900px) 30vw, 220px"
                      unoptimized
                    />
                    <span className={styles.position}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.score}>★ {score}</span>
                  </div>
                  <div className={styles.mediaInfo}>
                    <h3>{anime.title}</h3>
                    <p>{animeReleaseFormatLabels[releaseFormat]}<span aria-hidden="true">•</span>{animeStatusLabels[installment.status]}</p>
                  </div>
                </Link>
              );
            })}
            {trending.length === 0 ? (
              <p className={styles.emptyTrending}>Nenhum anime publicado nesta temporada ainda.</p>
            ) : null}
          </div>
        </section>

        <div className={styles.discoveryLayout}>
          <section className={styles.section} aria-labelledby="discovery-title">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionKicker}>Para sair do óbvio</span>
                <h2 id="discovery-title">Descubra seu próximo título</h2>
              </div>
            </div>

            <div className={styles.discoveryGrid}>
              {discovery.map((item) => {
                const { icon: Icon, label } = discoveryConfig[item.medium];

                return (
                  <Link className={styles.discoveryCard} href={workHref(item)} key={item.medium}>
                    <Image
                      src={assetUrl(item.coverUrl) ?? item.coverUrl}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 30vw"
                      unoptimized
                    />
                    <div className={styles.discoveryShade} />
                    <div className={styles.discoveryContent}>
                      <span><Icon aria-hidden="true" />{label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className={styles.ranking} aria-labelledby="ranking-title">
            <div className={styles.rankingHeading}>
              <span className={styles.sectionKicker}>Comunidade</span>
              <h2 id="ranking-title">Mais bem avaliados</h2>
            </div>
            <ol>
              {ranking.map((item, index) => (
                <li key={`${item.medium}:${item.slug}`}>
                  <Link href={workHref(item)}>
                    <span className={styles.rankingPosition}>{index + 1}</span>
                    <Image
                      className={styles.rankingCover}
                      src={assetUrl(item.coverUrl) ?? item.coverUrl}
                      alt=""
                      width={38}
                      height={54}
                      unoptimized
                    />
                    <span className={styles.rankingTitle}>
                      <strong>{item.title}</strong>
                      <small>{rankingMediumLabels[item.medium]}</small>
                    </span>
                    <span className={styles.rankingScore}>★ {item.score.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className={styles.rankingAction} href="/ranking/anime">
              Ver ranking completo
              <FiArrowRight aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
