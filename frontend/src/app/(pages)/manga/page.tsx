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
import { GiEvilBook } from "react-icons/gi";
import { RiFireLine, RiQuillPenLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./manga.module.css";

const publishingManga = [
  {
    title: "Dandadan",
    image: "/mangas/dandadan.jpg",
    href: "/manga/dandadan",
    format: "Manga",
    progress: "Capítulo 86",
    genres: ["Ação", "Comédia"],
    score: "8.7",
    frequency: "Semanal",
  },
  {
    title: "MAO",
    image: "/mangas/mao.jpg",
    href: "/manga/mao",
    format: "Manga",
    progress: "Capítulo 61",
    genres: ["Mistério", "Sobrenatural"],
    score: "8.2",
    frequency: "Semanal",
  },
  {
    title: "Centuria",
    image: "/mangas/centuria.jpg",
    href: "/manga/centuria",
    format: "Manga",
    progress: "Capítulo 34",
    genres: ["Ação", "Fantasia"],
    score: "8.4",
    frequency: "Semanal",
  },
  {
    title: "Kyoukai no Rinne",
    image: "/mangas/rinne.jpg",
    href: "/manga/kyoukai-no-rinne",
    format: "Manga",
    progress: "40 volumes",
    genres: ["Comédia", "Fantasia"],
    score: "7.9",
    frequency: "Completo",
  },
  {
    title: "Namaikizakari.",
    image: "/mangas/namaiki.jpg",
    href: "/manga/namaikizakari",
    format: "Manga",
    progress: "23 volumes",
    genres: ["Romance", "Escolar"],
    score: "8.1",
    frequency: "Completo",
  },
];

const trendingManga = [
  { title: "Dandadan", change: "+3", score: "8.7", image: "/mangas/dandadan.jpg", href: "/manga/dandadan" },
  { title: "Ranma ½", change: "+1", score: "8.6", image: "/mangas/ranma.jpg", href: "/manga/ranma" },
  { title: "Centuria", change: "+5", score: "8.4", image: "/mangas/centuria.jpg", href: "/manga/centuria" },
  { title: "MAO", change: "—", score: "8.2", image: "/mangas/mao.jpg", href: "/manga/mao" },
  { title: "InuYasha", change: "-2", score: "8.1", image: "/mangas/inuyasha.jpg", href: "/manga/inuyasha" },
];

const upcomingVolumes = [
  {
    title: "Dandadan — Volume 12",
    image: "/mangas/dandadan.jpg",
    href: "/manga/dandadan",
    date: "08 Out 2026",
    publisher: "Shueisha",
    description: "O próximo volume reúne uma nova etapa da investigação sobrenatural.",
  },
  {
    title: "MAO — Volume 8",
    image: "/mangas/mao.jpg",
    href: "/manga/mao",
    date: "15 Out 2026",
    publisher: "Shogakukan",
    description: "Novos mistérios aproximam Mao e Nanoka das respostas que procuram.",
  },
  {
    title: "Centuria — Volume 5",
    image: "/mangas/centuria.jpg",
    href: "/manga/centuria",
    date: "22 Out 2026",
    publisher: "Shueisha",
    description: "A jornada de Julian avança por um território ainda mais perigoso.",
  },
];

const releaseDays = [
  { day: "Seg", count: "12 capítulos" },
  { day: "Ter", count: "8 capítulos" },
  { day: "Qua", count: "15 capítulos" },
  { day: "Qui", count: "9 capítulos" },
  { day: "Sex", count: "17 capítulos" },
  { day: "Sáb", count: "6 capítulos" },
  { day: "Dom", count: "11 capítulos" },
];

function MangaPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><GiEvilBook aria-hidden="true" />Descobrir manga</span>
            <h1>Histórias para a próxima leitura</h1>
            <p>Explore obras em publicação, acompanhe capítulos e descubra os próximos volumes.</p>
          </div>
          <label className={styles.searchBox}>
            <FiSearch aria-hidden="true" />
            <span className={styles.srOnly}>Buscar manga</span>
            <input type="search" placeholder="Buscar por título ou autor..." />
          </label>
        </header>

        <div className={styles.filterBar} aria-label="Filtros de manga">
          <span className={styles.filterLabel}><FiFilter aria-hidden="true" />Filtros</span>
          <button className={styles.filterActive} type="button">Todos</button>
          <button type="button">Em publicação</button>
          <button type="button">Completos</button>
          <button type="button">One-shots</button>
          <button type="button">Demografia</button>
          <button type="button">Gêneros</button>
          <button type="button">Revistas</button>
        </div>

        <section className={styles.spotlight} aria-labelledby="spotlight-title">
          <Image src="/mangas/dandadan.jpg" alt="Capa de Dandadan" fill sizes="(max-width: 760px) 100vw, 1280px" priority />
          <div className={styles.spotlightShade} />
          <div className={styles.spotlightContent}>
            <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Leitura em destaque</span>
            <h2 id="spotlight-title">Dandadan</h2>
            <div className={styles.spotlightMeta}>
              <span>Manga</span><span>Em publicação</span><span>Shounen Jump+</span><strong>★ 8.7</strong>
            </div>
            <p>
              Momo acredita em fantasmas, Okarun acredita em alienígenas. A tentativa de
              provar quem está certo transforma a vida dos dois em um caos sobrenatural.
            </p>
            <div className={styles.spotlightGenres}><span>Ação</span><span>Comédia</span><span>Sobrenatural</span></div>
            <Link href="/manga/dandadan">Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.spotlightAside}>
            <span>Última atualização</span>
            <strong>Capítulo 86</strong>
            <small><FiClock aria-hidden="true" />há 2 dias</small>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="publishing-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Novos capítulos</span><h2 id="publishing-title">Em publicação</h2></div>
            <div className={styles.periodControls}><button type="button">‹</button><strong>Atualizações recentes</strong><button type="button">›</button></div>
          </div>

          <div className={styles.mangaGrid}>
            {publishingManga.map((manga) => (
              <Link className={styles.mangaCard} href={manga.href} key={manga.title}>
                <div className={styles.mangaCover}>
                  <Image src={manga.image} alt={`Capa de ${manga.title}`} fill sizes="(max-width: 580px) 46vw, (max-width: 980px) 30vw, 220px" />
                  <span className={styles.cardScore}>★ {manga.score}</span>
                  <span className={styles.publishingBadge}><span />Publicando</span>
                </div>
                <div className={styles.mangaInfo}>
                  <h3>{manga.title}</h3>
                  <p>{manga.format}<span>•</span>{manga.progress}</p>
                  <div className={styles.cardGenres}>{manga.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                  <small><RiQuillPenLine aria-hidden="true" />{manga.frequency}</small>
                </div>
              </Link>
            ))}
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
              {trendingManga.map((manga, index) => (
                <li key={manga.title}>
                  <Link href={manga.href}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <Image src={manga.image} alt="" width={42} height={58} />
                    <span className={styles.rankTitle}><strong>{manga.title}</strong><small>★ {manga.score}</small></span>
                    <span className={manga.change.startsWith("+") ? styles.rankUp : styles.rankChange}>{manga.change}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className={styles.sectionAction} href="/ranking/manga">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

          <section className={styles.releasesPanel} aria-labelledby="releases-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Agenda editorial</span><h2 id="releases-title">Novos capítulos</h2></div>
              <FiCalendar aria-hidden="true" />
            </div>
            <div className={styles.releaseDays}>
              {releaseDays.map((item, index) => (
                <button className={index === 4 ? styles.releaseDayActive : undefined} type="button" key={item.day}>
                  <strong>{item.day}</strong><span>{item.count}</span>
                </button>
              ))}
            </div>
            <div className={styles.chapterRelease}>
              <span className={styles.releaseTime}>00:00</span>
              <Image src="/mangas/dandadan.jpg" alt="" width={46} height={62} />
              <span><strong>Dandadan</strong><small>Capítulo 87 • Shounen Jump+</small></span>
              <span className={styles.releaseState}><FiBookOpen aria-hidden="true" />Hoje</span>
            </div>
            <div className={styles.chapterRelease}>
              <span className={styles.releaseTime}>12:00</span>
              <Image src="/mangas/mao.jpg" alt="" width={46} height={62} />
              <span><strong>MAO</strong><small>Capítulo 62 • Shounen Sunday</small></span>
              <span className={styles.releaseState}>Hoje</span>
            </div>
          </section>
        </div>

        <section className={styles.section} aria-labelledby="upcoming-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Calendário editorial</span><h2 id="upcoming-title">Próximos volumes</h2></div>
            <Link className={styles.headingLink} href="/manga?release=upcoming">Ver calendário <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.upcomingGrid}>
            {upcomingVolumes.map((manga) => (
              <Link className={styles.upcomingCard} href={manga.href} key={manga.title}>
                <Image src={manga.image} alt={`Capa de ${manga.title}`} width={104} height={144} />
                <div>
                  <span className={styles.releaseDate}><FiCalendar aria-hidden="true" />{manga.date}</span>
                  <h3>{manga.title}</h3>
                  <small>{manga.publisher}</small>
                  <p>{manga.description}</p>
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

export default MangaPage;
