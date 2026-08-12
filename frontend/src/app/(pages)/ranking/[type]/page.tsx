import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FiChevronDown, FiClock, FiFilter, FiSearch, FiTrendingUp } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiMedalLine } from "react-icons/ri";
import { FiTv } from "react-icons/fi";

import styles from "./ranking.module.css";
import type {
  AnimeReleaseFormat,
  WorkMedium,
} from "@/shared/types/entities";
import {
  animeReleaseFormatLabels,
  mediumLabels,
} from "@/shared/types/entities";

type RankingType = "anime" | "manga" | "light-novel";
type CoverTheme = "violet" | "crimson" | "amber" | "indigo" | "emerald";

type RankingItem = {
  title: string;
  image?: string;
  initials?: string;
  theme?: CoverTheme;
  href: string;
  medium: WorkMedium;
  releaseFormat?: AnimeReleaseFormat;
  status: string;
  genres: string[];
  score: string;
  ratings: string;
  members: string;
  change: string;
};

function getRankingFormat(item: RankingItem): string {
  return item.medium === "anime" && item.releaseFormat
    ? animeReleaseFormatLabels[item.releaseFormat]
    : mediumLabels[item.medium];
}

const animeRanking: RankingItem[] = [
  { title: "Gachiakuta", image: "/animes/gachiakuta.jpg", href: "/anime/gachiakuta", medium: "anime", releaseFormat: "tv", status: "Em exibição", genres: ["Ação", "Fantasia"], score: "8.86", ratings: "42 mil", members: "318 mil", change: "+2" },
  { title: "InuYasha", image: "/animes/inuyasha2.png", href: "/anime/inuyasha", medium: "anime", releaseFormat: "tv", status: "Completo", genres: ["Aventura", "Romance"], score: "8.74", ratings: "186 mil", members: "921 mil", change: "—" },
  { title: "MAO", image: "/animes/mao2.jpg", href: "/anime/mao", medium: "anime", releaseFormat: "tv", status: "Em exibição", genres: ["Mistério", "Sobrenatural"], score: "8.61", ratings: "31 mil", members: "204 mil", change: "+4" },
  { title: "Wolf's Rain", image: "/animes/wolfs.jpg", href: "/anime/wolfs-rain", medium: "anime", releaseFormat: "tv", status: "Completo", genres: ["Drama", "Fantasia"], score: "8.52", ratings: "94 mil", members: "480 mil", change: "-1" },
  { title: "Mayonaka Heart Tune", image: "/animes/mayonaka.jpg", href: "/anime/mayonaka-heart-tune", medium: "anime", releaseFormat: "tv", status: "Em exibição", genres: ["Comédia", "Romance"], score: "8.43", ratings: "27 mil", members: "179 mil", change: "+6" },
  { title: "Kyoukai no Rinne", image: "/animes/rinne2.jpg", href: "/anime/kyoukai-no-rinne", medium: "anime", releaseFormat: "tv", status: "Completo", genres: ["Comédia", "Fantasia"], score: "8.31", ratings: "76 mil", members: "402 mil", change: "-2" },
  { title: "Baby I Love You Daze", image: "/animes/baby.jpg", href: "/anime/baby-i-love-you-daze", medium: "anime", releaseFormat: "special", status: "Completo", genres: ["Romance", "Cotidiano"], score: "8.25", ratings: "18 mil", members: "121 mil", change: "+1" },
  { title: "Ranma ½", image: "/ranma.jpg", href: "/anime/ranma", medium: "anime", releaseFormat: "tv", status: "Completo", genres: ["Comédia", "Romance"], score: "8.19", ratings: "112 mil", members: "615 mil", change: "—" },
  { title: "InuYasha: Kanketsu-hen", image: "/animes/inuyasha2.png", href: "/anime/inuyasha-kanketsu-hen", medium: "anime", releaseFormat: "tv", status: "Completo", genres: ["Aventura", "Fantasia"], score: "8.12", ratings: "81 mil", members: "377 mil", change: "+3" },
  { title: "MAO: Special", image: "/animes/mao2.jpg", href: "/anime/mao-special", medium: "anime", releaseFormat: "special", status: "Completo", genres: ["Mistério", "Drama"], score: "8.06", ratings: "12 mil", members: "89 mil", change: "-3" },
];

const mangaRanking: RankingItem[] = [
  { title: "Dandadan", image: "/mangas/dandadan.jpg", href: "/manga/dandadan", medium: "manga", status: "Publicando", genres: ["Ação", "Comédia"], score: "9.02", ratings: "96 mil", members: "514 mil", change: "+1" },
  { title: "Ranma ½", image: "/mangas/ranma.jpg", href: "/manga/ranma", medium: "manga", status: "Completo", genres: ["Comédia", "Romance"], score: "8.91", ratings: "129 mil", members: "682 mil", change: "—" },
  { title: "Centuria", image: "/mangas/centuria.jpg", href: "/manga/centuria", medium: "manga", status: "Publicando", genres: ["Ação", "Fantasia"], score: "8.84", ratings: "38 mil", members: "226 mil", change: "+5" },
  { title: "MAO", image: "/mangas/mao.jpg", href: "/manga/mao", medium: "manga", status: "Publicando", genres: ["Mistério", "Sobrenatural"], score: "8.72", ratings: "44 mil", members: "251 mil", change: "+2" },
  { title: "InuYasha", image: "/mangas/inuyasha.jpg", href: "/manga/inuyasha", medium: "manga", status: "Completo", genres: ["Aventura", "Romance"], score: "8.66", ratings: "151 mil", members: "793 mil", change: "-2" },
  { title: "Maison Ikkoku", image: "/mangas/maison-ikkoku.png", href: "/manga/maison-ikkoku", medium: "manga", status: "Completo", genres: ["Comédia", "Romance"], score: "8.58", ratings: "57 mil", members: "304 mil", change: "—" },
  { title: "Urusei Yatsura", image: "/mangas/urusei-yatsura.jpg", href: "/manga/urusei-yatsura", medium: "manga", status: "Completo", genres: ["Comédia", "Sci-fi"], score: "8.49", ratings: "71 mil", members: "349 mil", change: "+3" },
  { title: "Kyoukai no Rinne", image: "/mangas/rinne.jpg", href: "/manga/kyoukai-no-rinne", medium: "manga", status: "Completo", genres: ["Comédia", "Fantasia"], score: "8.37", ratings: "48 mil", members: "273 mil", change: "-1" },
  { title: "Namaikizakari.", image: "/mangas/namaiki.jpg", href: "/manga/namaikizakari", medium: "manga", status: "Completo", genres: ["Romance", "Escolar"], score: "8.28", ratings: "63 mil", members: "331 mil", change: "+2" },
  { title: "Manga One", image: "/mangas/mangaone.jpg", href: "/manga/manga-one", medium: "manga", status: "Publicando", genres: ["Drama", "Cotidiano"], score: "8.17", ratings: "21 mil", members: "118 mil", change: "-4" },
];

const novelRanking: RankingItem[] = [
  { title: "Kusuriya no Hitorigoto", initials: "KH", theme: "emerald", href: "/light-novel/kusuriya-no-hitorigoto", medium: "light_novel", status: "Publicando", genres: ["Mistério", "Drama"], score: "9.08", ratings: "84 mil", members: "429 mil", change: "+1" },
  { title: "86: Eighty-Six", initials: "86", theme: "crimson", href: "/light-novel/86-eighty-six", medium: "light_novel", status: "Publicando", genres: ["Drama", "Sci-fi"], score: "8.96", ratings: "76 mil", members: "386 mil", change: "—" },
  { title: "Make Heroine ga Oosugiru!", image: "/light-novels/make-heroine.jpg", initials: "MH", theme: "violet", href: "/light-novel/make-heroine-ga-oosugiru", medium: "light_novel", status: "Publicando", genres: ["Comédia", "Romance"], score: "8.88", ratings: "45 mil", members: "267 mil", change: "+4" },
  { title: "Re:Zero kara Hajimeru Isekai Seikatsu", initials: "RZ", theme: "indigo", href: "/light-novel/rezero", medium: "light_novel", status: "Publicando", genres: ["Fantasia", "Drama"], score: "8.79", ratings: "109 mil", members: "612 mil", change: "-1" },
  { title: "Ookami to Koushinryou", initials: "OK", theme: "amber", href: "/light-novel/ookami-to-koushinryou", medium: "light_novel", status: "Publicando", genres: ["Aventura", "Romance"], score: "8.71", ratings: "68 mil", members: "352 mil", change: "+2" },
  { title: "Mahouka Koukou no Rettousei", initials: "MK", theme: "violet", href: "/light-novel/mahouka", medium: "light_novel", status: "Completo", genres: ["Ação", "Fantasia"], score: "8.62", ratings: "61 mil", members: "337 mil", change: "—" },
  { title: "Youjo Senki", initials: "YS", theme: "crimson", href: "/light-novel/youjo-senki", medium: "light_novel", status: "Publicando", genres: ["Ação", "Fantasia"], score: "8.53", ratings: "57 mil", members: "298 mil", change: "+3" },
  { title: "Honzuki no Gekokujou", initials: "HG", theme: "emerald", href: "/light-novel/honzuki-no-gekokujou", medium: "light_novel", status: "Completo", genres: ["Fantasia", "Cotidiano"], score: "8.45", ratings: "49 mil", members: "281 mil", change: "+1" },
  { title: "Baccano!", initials: "BC", theme: "amber", href: "/light-novel/baccano", medium: "light_novel", status: "Publicando", genres: ["Ação", "Mistério"], score: "8.37", ratings: "32 mil", members: "194 mil", change: "-2" },
  { title: "Violet Evergarden", initials: "VE", theme: "indigo", href: "/light-novel/violet-evergarden", medium: "light_novel", status: "Completo", genres: ["Drama", "Fantasia"], score: "8.29", ratings: "41 mil", members: "244 mil", change: "-3" },
];

const rankingConfig = {
  anime: { label: "Anime", plural: "animes", icon: FiTv, items: animeRanking },
  manga: { label: "Manga", plural: "mangas", icon: GiEvilBook, items: mangaRanking },
  "light-novel": { label: "Light novel", plural: "light novels", icon: LuBookHeart, items: novelRanking },
};

function Artwork({ item, className }: { item: RankingItem; className?: string }) {
  if (item.image) {
    return <Image className={className} src={item.image} alt={`Capa de ${item.title}`} width={68} height={96} />;
  }

  return (
    <span className={`${styles.placeholderCover} ${styles[item.theme ?? "violet"]} ${className ?? ""}`} aria-label={`Capa temporária de ${item.title}`}>
      <strong>{item.initials}</strong>
      <small>{item.title}</small>
    </span>
  );
}

async function RankingByTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  if (!(type in rankingConfig)) redirect("/ranking/anime");

  const rankingType = type as RankingType;
  const config = rankingConfig[rankingType];
  const Icon = config.icon;
  const podium = [config.items[1], config.items[0], config.items[2]];
  const podiumPositions = [2, 1, 3];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><RiMedalLine aria-hidden="true" />Ranking OtakuList</span>
            <h1>Os {config.plural} mais bem avaliados</h1>
            <p>Compare scores, popularidade e movimentação da comunidade em uma lista única.</p>
          </div>
          <div className={styles.updatedAt}><FiClock aria-hidden="true" /><span>Atualizado há 5 minutos</span></div>
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

        <section className={styles.podiumSection} aria-label={`Pódio de ${config.plural}`}>
          <div className={styles.podiumIntro}>
            <span><Icon aria-hidden="true" />Top 3</span>
            <h2>Destaques do ranking</h2>
            <p>As obras com melhor score ponderado entre usuários ativos.</p>
          </div>
          <div className={styles.podium}>
            {podium.map((item, index) => (
              <Link className={`${styles.podiumCard} ${podiumPositions[index] === 1 ? styles.podiumFirst : ""}`} href={item.href} key={item.title}>
                <span className={styles.podiumPosition}>{podiumPositions[index]}</span>
                <Artwork item={item} className={styles.podiumCover} />
                <span className={styles.podiumCopy}><strong>{item.title}</strong><small>{getRankingFormat(item)} • {item.status}</small></span>
                <span className={styles.podiumScore}>★ {item.score}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.rankingSection} aria-labelledby="full-ranking-title">
          <div className={styles.rankingHeading}>
            <div><span className={styles.sectionKicker}>Top 100</span><h2 id="full-ranking-title">Ranking de {config.label}</h2></div>
            <label className={styles.searchBox}><FiSearch aria-hidden="true" /><span className={styles.srOnly}>Buscar no ranking</span><input type="search" placeholder="Buscar no ranking..." /></label>
          </div>

          <div className={styles.filterBar}>
            <span><FiFilter aria-hidden="true" />Ordenar por</span>
            <button className={styles.filterActive} type="button">Melhor score</button>
            <button type="button">Popularidade</button>
            <button type="button">Trending</button>
            <button type="button">Ano</button>
            <button type="button">Status</button>
            <button type="button">Gêneros</button>
          </div>

          <div className={styles.tableHeader} aria-hidden="true">
            <span>Posição</span><span>Obra</span><span>Formato</span><span>Score</span><span>Popularidade</span>
          </div>

          <ol className={styles.rankingList}>
            {config.items.map((item, index) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <span className={styles.positionBlock}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <small className={item.change.startsWith("+") ? styles.changeUp : item.change.startsWith("-") ? styles.changeDown : undefined}>
                      {item.change}
                    </small>
                  </span>
                  <span className={styles.identityBlock}>
                    <Artwork item={item} className={styles.listCover} />
                    <span><strong>{item.title}</strong><small>{item.genres.join(" • ")}</small></span>
                  </span>
                  <span className={styles.formatBlock}><strong>{getRankingFormat(item)}</strong><small>{item.status}</small></span>
                  <span className={styles.scoreBlock}><strong>★ {item.score}</strong><small>{item.ratings} avaliações</small></span>
                  <span className={styles.membersBlock}><strong>{item.members}</strong><small>membros</small></span>
                </Link>
              </li>
            ))}
          </ol>

          <div className={styles.loadMore}>
            <span>Exibindo 10 de 100 posições</span>
            <button type="button">Carregar mais 25<FiChevronDown aria-hidden="true" /></button>
            <small><FiTrendingUp aria-hidden="true" />A próxima página poderá carregar automaticamente ao chegar aqui.</small>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RankingByTypePage;
