import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import { LuBookHeart } from "react-icons/lu";
import { RiFireLine, RiQuillPenLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./lightnovel.module.css";

type CoverTheme = "violet" | "crimson" | "amber" | "indigo" | "emerald";

type Novel = {
  title: string;
  initials: string;
  theme: CoverTheme;
  image?: string;
  href: string;
  progress: string;
  genres: string[];
  score: string;
  publisher: string;
};

const publishingNovels: Novel[] = [
  {
    title: "Make Heroine ga Oosugiru!",
    initials: "MH",
    theme: "violet",
    image: "/light-novels/make-heroine.jpg",
    href: "/light-novel/make-heroine-ga-oosugiru",
    progress: "Volume 8",
    genres: ["Comédia", "Romance"],
    score: "8.5",
    publisher: "Gagaga Bunko",
  },
  {
    title: "86: Eighty-Six",
    initials: "86",
    theme: "crimson",
    href: "/light-novel/86-eighty-six",
    progress: "Volume 14",
    genres: ["Drama", "Sci-fi"],
    score: "8.8",
    publisher: "Dengeki Bunko",
  },
  {
    title: "Kusuriya no Hitorigoto",
    initials: "KH",
    theme: "emerald",
    href: "/light-novel/kusuriya-no-hitorigoto",
    progress: "Volume 16",
    genres: ["Mistério", "Drama"],
    score: "8.9",
    publisher: "Hero Bunko",
  },
  {
    title: "Re:Zero kara Hajimeru Isekai Seikatsu",
    initials: "RZ",
    theme: "indigo",
    href: "/light-novel/rezero",
    progress: "Volume 41",
    genres: ["Fantasia", "Drama"],
    score: "8.7",
    publisher: "MF Bunko J",
  },
  {
    title: "Ookami to Koushinryou",
    initials: "OK",
    theme: "amber",
    href: "/light-novel/ookami-to-koushinryou",
    progress: "Volume 24",
    genres: ["Aventura", "Romance"],
    score: "8.6",
    publisher: "Dengeki Bunko",
  },
];

const trendingNovels = [publishingNovels[2], publishingNovels[1], publishingNovels[0], publishingNovels[3], publishingNovels[4]];
const trendingChanges = ["+2", "+1", "+4", "—", "-1"];

const upcomingVolumes = [
  {
    novel: publishingNovels[0],
    title: "Make Heroine ga Oosugiru! — Volume 9",
    date: "06 Nov 2026",
    description: "Um novo volume para as heroínas que sempre ficam fora do final feliz.",
  },
  {
    novel: publishingNovels[1],
    title: "86: Eighty-Six — Volume 15",
    date: "14 Nov 2026",
    description: "A próxima etapa da guerra coloca a Spearhead diante de novas escolhas.",
  },
  {
    novel: publishingNovels[2],
    title: "Kusuriya no Hitorigoto — Volume 17",
    date: "25 Nov 2026",
    description: "Maomao encontra outro mistério escondido nos corredores do palácio.",
  },
];

const releaseMonths = [
  { month: "Ago", count: "18 volumes" },
  { month: "Set", count: "22 volumes" },
  { month: "Out", count: "27 volumes" },
  { month: "Nov", count: "31 volumes" },
  { month: "Dez", count: "19 volumes" },
];

function NovelArtwork({ novel, size }: { novel: Pick<Novel, "title" | "initials" | "theme" | "image">; size: "card" | "small" | "volume" }) {
  return (
    <span className={`${styles.novelArtwork} ${styles[novel.theme]} ${styles[`artwork${size}`]}`}>
      {novel.image ? (
        <Image src={novel.image} alt={`Capa de ${novel.title}`} fill sizes={size === "small" ? "42px" : size === "volume" ? "104px" : "220px"} />
      ) : (
        <>
          <span className={styles.artworkMark}>{novel.initials}</span>
          <span className={styles.artworkTitle}>{novel.title}</span>
          <span className={styles.artworkOrnament} aria-hidden="true" />
        </>
      )}
    </span>
  );
}

function LightNovelPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><LuBookHeart aria-hidden="true" />Descobrir light novels</span>
            <h1>Novos mundos, volume por volume</h1>
            <p>Explore séries em publicação, acompanhe volumes e encontre sua próxima leitura.</p>
          </div>
          <label className={styles.searchBox}>
            <FiSearch aria-hidden="true" />
            <span className={styles.srOnly}>Buscar light novel</span>
            <input type="search" placeholder="Buscar por título ou autor..." />
          </label>
        </header>

        <div className={styles.filterBar} aria-label="Filtros de light novel">
          <span className={styles.filterLabel}><FiFilter aria-hidden="true" />Filtros</span>
          <button className={styles.filterActive} type="button">Todas</button>
          <button type="button">Em publicação</button>
          <button type="button">Completas</button>
          <button type="button">Web novels</button>
          <button type="button">Editoras</button>
          <button type="button">Gêneros</button>
          <button type="button">Ano</button>
        </div>

        <section className={styles.spotlight} aria-labelledby="spotlight-title">
          <Image src="/light-novels/make-heroine.jpg" alt="Capa de Make Heroine ga Oosugiru!" fill sizes="(max-width: 760px) 100vw, 1280px" priority />
          <div className={styles.spotlightShade} />
          <div className={styles.spotlightContent}>
            <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Novel em destaque</span>
            <h2 id="spotlight-title">Make Heroine ga Oosugiru!</h2>
            <div className={styles.spotlightMeta}>
              <span>Light novel</span><span>Em publicação</span><span>Gagaga Bunko</span><strong>★ 8.5</strong>
            </div>
            <p>
              Kazuhiko acaba envolvido com garotas carismáticas que perderam suas próprias
              histórias de amor — e descobre que ficar em segundo plano também rende boas histórias.
            </p>
            <div className={styles.spotlightGenres}><span>Comédia</span><span>Romance</span><span>Vida escolar</span></div>
            <Link href="/light-novel/make-heroine-ga-oosugiru">Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.spotlightAside}>
            <span>Último volume</span>
            <strong>Volume 8</strong>
            <small><FiClock aria-hidden="true" />lançado recentemente</small>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="publishing-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Séries para acompanhar</span><h2 id="publishing-title">Em publicação</h2></div>
            <div className={styles.periodControls}><button type="button">‹</button><strong>Atualizações recentes</strong><button type="button">›</button></div>
          </div>

          <div className={styles.novelGrid}>
            {publishingNovels.map((novel) => (
              <Link className={styles.novelCard} href={novel.href} key={novel.title}>
                <div className={styles.novelCover}>
                  <NovelArtwork novel={novel} size="card" />
                  <span className={styles.cardScore}>★ {novel.score}</span>
                  <span className={styles.publishingBadge}><span />Publicando</span>
                </div>
                <div className={styles.novelInfo}>
                  <h3>{novel.title}</h3>
                  <p>Light novel<span>•</span>{novel.progress}</p>
                  <div className={styles.cardGenres}>{novel.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                  <small><RiQuillPenLine aria-hidden="true" />{novel.publisher}</small>
                </div>
              </Link>
            ))}
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
              {trendingNovels.map((novel, index) => (
                <li key={novel.title}>
                  <Link href={novel.href}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <NovelArtwork novel={novel} size="small" />
                    <span className={styles.rankTitle}><strong>{novel.title}</strong><small>★ {novel.score}</small></span>
                    <span className={trendingChanges[index].startsWith("+") ? styles.rankUp : styles.rankChange}>{trendingChanges[index]}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className={styles.sectionAction} href="/ranking/light-novel">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

          <section className={styles.releasesPanel} aria-labelledby="releases-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Agenda editorial</span><h2 id="releases-title">Lançamentos por mês</h2></div>
              <FiCalendar aria-hidden="true" />
            </div>
            <div className={styles.releaseMonths}>
              {releaseMonths.map((item, index) => (
                <button className={index === 3 ? styles.releaseMonthActive : undefined} type="button" key={item.month}>
                  <strong>{item.month}</strong><span>{item.count}</span>
                </button>
              ))}
            </div>
            <div className={styles.volumeRelease}>
              <span className={styles.releaseDateShort}>06 Nov</span>
              <NovelArtwork novel={publishingNovels[0]} size="small" />
              <span><strong>Make Heroine ga Oosugiru!</strong><small>Volume 9 • Gagaga Bunko</small></span>
              <span className={styles.releaseState}><FiBookOpen aria-hidden="true" />Novo</span>
            </div>
            <div className={styles.volumeRelease}>
              <span className={styles.releaseDateShort}>14 Nov</span>
              <NovelArtwork novel={publishingNovels[1]} size="small" />
              <span><strong>86: Eighty-Six</strong><small>Volume 15 • Dengeki Bunko</small></span>
              <span className={styles.releaseState}>Em breve</span>
            </div>
          </section>
        </div>

        <section className={styles.section} aria-labelledby="upcoming-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Próximas leituras</span><h2 id="upcoming-title">Volumes em destaque</h2></div>
            <Link className={styles.headingLink} href="/light-novel?release=upcoming">Ver calendário <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.upcomingGrid}>
            {upcomingVolumes.map(({ novel, title, date, description }) => (
              <Link className={styles.upcomingCard} href={novel.href} key={title}>
                <NovelArtwork novel={novel} size="volume" />
                <div>
                  <span className={styles.releaseDate}><FiCalendar aria-hidden="true" />{date}</span>
                  <h3>{title}</h3>
                  <small>{novel.publisher}</small>
                  <p>{description}</p>
                </div>
                <FiArrowRight className={styles.cardArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default LightNovelPage;
