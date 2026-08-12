import Image from "next/image";
import Link from "next/link";

import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiFilter,
  FiPlay,
  FiSearch,
  FiTv,
} from "react-icons/fi";
import { RiFireLine, RiSparkling2Line } from "react-icons/ri";

import styles from "./anime.module.css";
import { animeReleaseFormatLabels } from "@/shared/types/entities";

const seasonAnime = [
  {
    title: "Gachiakuta",
    image: "/animes/gachiakuta.jpg",
    href: "/anime/gachiakuta",
    releaseFormat: "tv" as const,
    episodes: "8 / 24 episódios",
    genres: ["Ação", "Fantasia"],
    score: "8.6",
    day: "Domingo",
  },
  {
    title: "MAO",
    image: "/animes/mao2.jpg",
    href: "/anime/mao",
    releaseFormat: "tv" as const,
    episodes: "5 / 12 episódios",
    genres: ["Mistério", "Sobrenatural"],
    score: "8.2",
    day: "Terça-feira",
  },
  {
    title: "Mayonaka Heart Tune",
    image: "/animes/mayonaka.jpg",
    href: "/anime/mayonaka-heart-tune",
    releaseFormat: "tv" as const,
    episodes: "6 / 12 episódios",
    genres: ["Comédia", "Romance"],
    score: "8.0",
    day: "Quarta-feira",
  },
  {
    title: "Kyoukai no Rinne",
    image: "/animes/rinne2.jpg",
    href: "/anime/kyoukai-no-rinne",
    releaseFormat: "tv" as const,
    episodes: "12 / 25 episódios",
    genres: ["Comédia", "Fantasia"],
    score: "7.7",
    day: "Sábado",
  },
  {
    title: "InuYasha",
    image: "/animes/inuyasha2.png",
    href: "/anime/inuyasha",
    releaseFormat: "tv" as const,
    episodes: "Completo",
    genres: ["Aventura", "Romance"],
    score: "8.4",
    day: "Catálogo",
  },
];

const trendingAnime = [
  { title: "Gachiakuta", change: "+2", score: "8.6", image: "/animes/gachiakuta.jpg", href: "/anime/gachiakuta" },
  { title: "InuYasha", change: "—", score: "8.4", image: "/animes/inuyasha2.png", href: "/anime/inuyasha" },
  { title: "MAO", change: "+4", score: "8.2", image: "/animes/mao2.jpg", href: "/anime/mao" },
  { title: "Mayonaka Heart Tune", change: "+1", score: "8.0", image: "/animes/mayonaka.jpg", href: "/anime/mayonaka-heart-tune" },
  { title: "Wolf's Rain", change: "-2", score: "8.0", image: "/animes/wolfs.jpg", href: "/anime/wolfs-rain" },
];

const upcomingAnime = [
  {
    title: "Baby I Love You Daze",
    image: "/animes/baby.jpg",
    href: "/anime/baby-i-love-you-daze",
    date: "03 Out 2026",
    releaseFormat: "special" as const,
    description: "Uma estreia curta com romance e cotidiano.",
  },
  {
    title: "Wolf's Rain",
    image: "/animes/wolfs.jpg",
    href: "/anime/wolfs-rain",
    date: "11 Out 2026",
    releaseFormat: "tv" as const,
    description: "Fantasia, drama e uma jornada em busca do paraíso.",
  },
  {
    title: "InuYasha",
    image: "/animes/inuyasha2.png",
    href: "/anime/inuyasha",
    date: "19 Out 2026",
    releaseFormat: "tv" as const,
    description: "Aventura sobrenatural entre duas épocas.",
  },
];

const schedule = [
  { day: "Seg", count: "4 títulos" },
  { day: "Ter", count: "7 títulos" },
  { day: "Qua", count: "5 títulos" },
  { day: "Qui", count: "8 títulos" },
  { day: "Sex", count: "6 títulos" },
  { day: "Sáb", count: "11 títulos" },
  { day: "Dom", count: "9 títulos" },
];

function AnimePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><FiTv aria-hidden="true" />Descobrir anime</span>
            <h1>Encontre sua próxima história</h1>
            <p>Explore a temporada, acompanhe o que está em alta e veja o que estreia em breve.</p>
          </div>
          <label className={styles.searchBox}>
            <FiSearch aria-hidden="true" />
            <span className={styles.srOnly}>Buscar anime</span>
            <input type="search" placeholder="Buscar por título..." />
          </label>
        </header>

        <div className={styles.filterBar} aria-label="Filtros de anime">
          <span className={styles.filterLabel}><FiFilter aria-hidden="true" />Filtros</span>
          <button className={styles.filterActive} type="button">Todos</button>
          <button type="button">TV</button>
          <button type="button">Filmes</button>
          <button type="button">OVA</button>
          <button type="button">Em lançamento</button>
          <button type="button">Próximos</button>
          <button type="button">Gêneros</button>
        </div>

        <section className={styles.spotlight} aria-labelledby="spotlight-title">
          <Image
            src="/animes/gachiakuta.jpg"
            alt="Capa de Gachiakuta"
            fill
            sizes="(max-width: 760px) 100vw, 1280px"
            priority
          />
          <div className={styles.spotlightShade} />
          <div className={styles.spotlightContent}>
            <span className={styles.spotlightLabel}><RiSparkling2Line aria-hidden="true" />Destaque da temporada</span>
            <h2 id="spotlight-title">Gachiakuta</h2>
            <div className={styles.spotlightMeta}>
              <span>TV</span><span>24 episódios</span><span>Domingos</span><strong>★ 8.6</strong>
            </div>
            <p>
              Em uma cidade suspensa onde os rejeitados são lançados em um abismo,
              Rudo transforma a própria revolta em força para sobreviver.
            </p>
            <div className={styles.spotlightGenres}><span>Ação</span><span>Fantasia</span><span>Drama</span></div>
            <Link href="/anime/gachiakuta">Ver detalhes <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.spotlightAside}>
            <span>Próximo episódio</span>
            <strong>Domingo, 18:00</strong>
            <small><FiClock aria-hidden="true" />em 2 dias</small>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="season-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>Verão 2026</span>
              <h2 id="season-title">Animes da temporada</h2>
            </div>
            <div className={styles.seasonControls}>
              <button type="button">‹</button>
              <strong>Verão 2026</strong>
              <button type="button">›</button>
            </div>
          </div>

          <div className={styles.animeGrid}>
            {seasonAnime.map((anime) => (
              <Link className={styles.animeCard} href={anime.href} key={anime.title}>
                <div className={styles.animeCover}>
                  <Image src={anime.image} alt={`Capa de ${anime.title}`} fill sizes="(max-width: 580px) 46vw, (max-width: 980px) 30vw, 220px" />
                  <span className={styles.cardScore}>★ {anime.score}</span>
                  <span className={styles.airingBadge}><span />Em exibição</span>
                </div>
                <div className={styles.animeInfo}>
                  <h3>{anime.title}</h3>
                  <p>{animeReleaseFormatLabels[anime.releaseFormat]}<span>•</span>{anime.episodes}</p>
                  <div className={styles.cardGenres}>{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                  <small><FiCalendar aria-hidden="true" />{anime.day}</small>
                </div>
              </Link>
            ))}
          </div>
          <Link className={styles.sectionAction} href="/anime?season=summer-2026">Ver todos da temporada <FiArrowRight aria-hidden="true" /></Link>
        </section>

        <div className={styles.middleGrid}>
          <section className={styles.trendingPanel} aria-labelledby="trending-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Comunidade</span><h2 id="trending-title">Trending agora</h2></div>
              <RiFireLine aria-hidden="true" />
            </div>
            <ol>
              {trendingAnime.map((anime, index) => (
                <li key={anime.title}>
                  <Link href={anime.href}>
                    <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                    <Image src={anime.image} alt="" width={42} height={58} />
                    <span className={styles.rankTitle}><strong>{anime.title}</strong><small>★ {anime.score}</small></span>
                    <span className={anime.change.startsWith("+") ? styles.rankUp : styles.rankChange}>{anime.change}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className={styles.sectionAction} href="/ranking/anime">Ver ranking completo <FiArrowRight aria-hidden="true" /></Link>
          </section>

          <section className={styles.schedulePanel} aria-labelledby="schedule-title">
            <div className={styles.panelHeading}>
              <div><span className={styles.sectionKicker}>Agenda semanal</span><h2 id="schedule-title">Calendário de episódios</h2></div>
              <FiCalendar aria-hidden="true" />
            </div>
            <div className={styles.scheduleDays}>
              {schedule.map((item, index) => (
                <button className={index === 4 ? styles.scheduleActive : undefined} type="button" key={item.day}>
                  <strong>{item.day}</strong><span>{item.count}</span>
                </button>
              ))}
            </div>
            <div className={styles.todaySchedule}>
              <span className={styles.time}>18:00</span>
              <Image src="/animes/gachiakuta.jpg" alt="" width={46} height={62} />
              <span><strong>Gachiakuta</strong><small>Episódio 9</small></span>
              <span className={styles.releaseState}><FiPlay aria-hidden="true" />Hoje</span>
            </div>
            <div className={styles.todaySchedule}>
              <span className={styles.time}>21:30</span>
              <Image src="/animes/mayonaka.jpg" alt="" width={46} height={62} />
              <span><strong>Mayonaka Heart Tune</strong><small>Episódio 7</small></span>
              <span className={styles.releaseState}>Hoje</span>
            </div>
          </section>
        </div>

        <section className={styles.section} aria-labelledby="upcoming-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>Próxima temporada</span><h2 id="upcoming-title">Próximos lançamentos</h2></div>
            <Link className={styles.headingLink} href="/anime?status=upcoming">Ver calendário <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className={styles.upcomingGrid}>
            {upcomingAnime.map((anime) => (
              <Link className={styles.upcomingCard} href={anime.href} key={anime.title}>
                <Image src={anime.image} alt={`Capa de ${anime.title}`} width={104} height={144} />
                <div>
                  <span className={styles.releaseDate}><FiCalendar aria-hidden="true" />{anime.date}</span>
                  <h3>{anime.title}</h3>
                  <small>{animeReleaseFormatLabels[anime.releaseFormat]}</small>
                  <p>{anime.description}</p>
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

export default AnimePage;
