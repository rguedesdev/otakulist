import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiMedalLine } from "react-icons/ri";
import { FiTv } from "react-icons/fi";

import styles from "./ranking.module.css";
import { assetUrl } from "@/shared/auth/api";
import type {
  AnimeReleaseFormat,
  WorkMedium,
} from "@/shared/types/entities";
import {
  animeReleaseFormatLabels,
  mediumLabels,
} from "@/shared/types/entities";

type RankingType = "anime" | "manga" | "light-novel";
type RankingItem = {
  title: string;
  image: string;
  href: string;
  medium: WorkMedium;
  releaseFormat?: AnimeReleaseFormat;
  score: string;
  ratings: string;
};

function getRankingFormat(item: RankingItem): string {
  return item.medium === "anime" && item.releaseFormat
    ? animeReleaseFormatLabels[item.releaseFormat]
    : mediumLabels[item.medium];
}

const rankingConfig = {
  anime: { label: "Anime", plural: "animes", icon: FiTv, items: [] as RankingItem[] },
  manga: { label: "Manga", plural: "mangas", icon: GiEvilBook, items: [] as RankingItem[] },
  "light-novel": { label: "Light novel", plural: "light novels", icon: LuBookHeart, items: [] as RankingItem[] },
};

const catalogRankingQuery = `query CatalogRanking($medium: WorkMedium!, $includeAdult: Boolean!) {
  catalogRankingWorks(medium: $medium, includeAdult: $includeAdult) {
    title slug coverUrl score ratingCount
  }
}`;

async function getCatalogRanking(type: RankingType): Promise<RankingItem[]> {
  const includeAdult = (await cookies()).get("otakulist-adult-content")?.value === "1";
  const medium = type === "anime" ? "ANIME" : type === "manga" ? "MANGA" : "LIGHT_NOVEL";
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: catalogRankingQuery, variables: { medium, includeAdult } }),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const body = await response.json() as { data?: { catalogRankingWorks: Array<{ title: string; slug: string; coverUrl: string; score: number; ratingCount: number }> }; errors?: unknown[] };
    if (body.errors || !body.data) return [];
    const itemMedium = type === "anime" ? "anime" : type === "manga" ? "manga" : "light_novel";
    return body.data.catalogRankingWorks.map((item) => ({
      title: item.title,
      image: assetUrl(item.coverUrl) ?? item.coverUrl,
      href: `/${type === "light-novel" ? "light-novel" : type}/${item.slug}`,
      medium: itemMedium,
      score: item.ratingCount > 0 ? item.score.toFixed(2) : "—",
      ratings: String(item.ratingCount),
    }));
  } catch {
    return [];
  }
}

function Artwork({ item, className }: { item: RankingItem; className?: string }) {
  return <Image className={className} src={item.image} alt={`Capa de ${item.title}`} width={68} height={96} unoptimized />;
}

async function RankingByTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  if (!(type in rankingConfig)) redirect("/ranking/anime");

  const rankingType = type as RankingType;
  const baseConfig = rankingConfig[rankingType];
  const config = { ...baseConfig, items: await getCatalogRanking(rankingType) };
  const Icon = config.icon;
  const podium = config.items.length >= 3 ? [config.items[1], config.items[0], config.items[2]] : config.items.slice(0, 3);
  const podiumPositions = config.items.length < 3 ? config.items.map((_, index) => index + 1) : [2, 1, 3];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><RiMedalLine aria-hidden="true" />Ranking OtakuList</span>
            <h1>Os {config.plural} mais bem avaliados</h1>
            <p>Obras publicadas no catálogo, ordenadas pelas avaliações registradas.</p>
          </div>
        </header>

        <nav className={styles.typeTabs} aria-label="Tipo do ranking">
          {(Object.keys(rankingConfig) as RankingType[]).map((key) => {
            const TabIcon = rankingConfig[key].icon;
            return (
              <Link className={rankingType === key ? styles.typeTabActive : undefined} href={`/ranking/${key}`} key={key}>
                <TabIcon aria-hidden="true" />{rankingConfig[key].label}
              </Link>
            );
          })}
        </nav>

        {config.items.length > 0 && <section className={styles.podiumSection} aria-label={`Pódio de ${config.plural}`}>
          <div className={styles.podiumIntro}>
            <span><Icon aria-hidden="true" />Top 3</span>
            <h2>Destaques do ranking</h2>
            <p>Ordenadas pelas avaliações registradas; obras sem nota aparecem ao final.</p>
          </div>
          <div className={styles.podium}>
            {podium.map((item, index) => (
              <Link className={`${styles.podiumCard} ${podiumPositions[index] === 1 ? styles.podiumFirst : podiumPositions[index] === 3 ? styles.podiumThird : ""}`} href={item.href} key={item.title}>
                <span className={styles.podiumPosition}>{podiumPositions[index]}</span>
                <Artwork item={item} className={styles.podiumCover} />
                <span className={styles.podiumCopy}><strong>{item.title}</strong><small>{item.ratings === "0" ? "Sem avaliações" : `${item.ratings} avaliações`}</small></span>
                <span className={styles.podiumScore}>{item.score === "—" ? "—" : `★ ${item.score}`}</span>
              </Link>
            ))}
          </div>
        </section>}

        <section className={styles.rankingSection} aria-labelledby="full-ranking-title">
          <div className={styles.rankingHeading}>
            <div><span className={styles.sectionKicker}>Top 100</span><h2 id="full-ranking-title">Ranking de {config.label}</h2></div>
          </div>

          <div className={styles.tableHeader} aria-hidden="true">
            <span>Posição</span><span>Obra</span><span>Formato</span><span>Score</span><span>Avaliações</span>
          </div>

          <ol className={styles.rankingList}>
            {config.items.map((item, index) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <span className={styles.positionBlock}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                  </span>
                  <span className={styles.identityBlock}>
                    <Artwork item={item} className={styles.listCover} />
                    <span><strong>{item.title}</strong></span>
                  </span>
                  <span className={styles.formatBlock}><strong>{getRankingFormat(item)}</strong></span>
                  <span className={styles.scoreBlock}><strong>{item.score === "—" ? "—" : `★ ${item.score}`}</strong></span>
                  <span className={styles.membersBlock}><strong>{item.ratings}</strong><small>avaliações</small></span>
                </Link>
              </li>
            ))}
          </ol>

          {config.items.length === 0
            ? <p className={styles.emptyRanking}>Ainda não há obras publicadas nesta categoria.</p>
            : null}
        </section>
      </div>
    </main>
  );
}

export default RankingByTypePage;
