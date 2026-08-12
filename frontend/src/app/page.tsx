import Image from "next/image";
import Link from "next/link";

import { FiArrowRight, FiCalendar, FiCompass, FiPlay } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiBookmark3Line, RiSparkling2Line } from "react-icons/ri";

import styles from "./home.module.css";

const trendingTitles = [
  {
    title: "Gachiakuta",
    image: "/animes/gachiakuta.jpg",
    href: "/anime/gachiakuta",
    format: "TV",
    detail: "Em lançamento",
    score: "8.6",
  },
  {
    title: "MAO",
    image: "/animes/mao2.jpg",
    href: "/anime/mao",
    format: "TV",
    detail: "12 episódios",
    score: "8.2",
  },
  {
    title: "Mayonaka Heart Tune",
    image: "/animes/mayonaka.jpg",
    href: "/anime/mayonaka-heart-tune",
    format: "TV",
    detail: "Em lançamento",
    score: "8.0",
  },
  {
    title: "Kyoukai no Rinne",
    image: "/animes/rinne2.jpg",
    href: "/anime/kyoukai-no-rinne",
    format: "TV",
    detail: "Completo",
    score: "7.7",
  },
  {
    title: "InuYasha",
    image: "/animes/inuyasha2.png",
    href: "/anime/inuyasha",
    format: "TV",
    detail: "Completo",
    score: "8.4",
  },
];

const discoveryTitles = [
  {
    label: "Anime para maratonar",
    title: "Wolf's Rain",
    description: "Uma jornada melancólica em busca de um paraíso que talvez nem exista.",
    image: "/animes/wolfs.jpg",
    href: "/anime/wolfs-rain",
    icon: FiPlay,
  },
  {
    label: "Manga em destaque",
    title: "Dandadan",
    description: "Ocultismo, alienígenas e uma dupla que transforma o caos em aventura.",
    image: "/mangas/dandadan.jpg",
    href: "/manga/dandadan",
    icon: GiEvilBook,
  },
  {
    label: "Light novel para conhecer",
    title: "Make Heroine ga Oosugiru!",
    description: "Comédia romântica sobre quem normalmente ficaria fora dos holofotes.",
    image: "/light-novels/make-heroine.jpg",
    href: "/light-novel/make-heroine-ga-oosugiru",
    icon: LuBookHeart,
  },
];

const ranking = [
  { title: "Gachiakuta", type: "Anime", score: "8.6", image: "/animes/gachiakuta.jpg", href: "/anime/gachiakuta" },
  { title: "InuYasha", type: "Anime", score: "8.4", image: "/animes/inuyasha2.png", href: "/anime/inuyasha" },
  { title: "Dandadan", type: "Manga", score: "8.3", image: "/mangas/dandadan.jpg", href: "/manga/dandadan" },
  { title: "MAO", type: "Anime", score: "8.2", image: "/animes/mao2.jpg", href: "/anime/mao" },
  { title: "Wolf's Rain", type: "Anime", score: "8.0", image: "/animes/wolfs.jpg", href: "/anime/wolfs-rain" },
];

function HomePage() {
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
              <Link className={styles.primaryAction} href="/anime/gachiakuta">
                Explorar destaques
                <FiArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.secondaryAction} href="/anime/mao">
                <RiBookmark3Line aria-hidden="true" />
                Conhecer o tracker
              </Link>
            </div>
          </div>

          <Link className={styles.featured} href="/anime/gachiakuta">
            <Image
              src="/animes/gachiakuta.jpg"
              alt="Capa de Gachiakuta"
              fill
              sizes="(max-width: 820px) 100vw, 44vw"
              priority
            />
            <div className={styles.featuredShade} />
            <div className={styles.featuredTopline}>
              <span>Escolha da semana</span>
              <strong>8.6</strong>
            </div>
            <div className={styles.featuredInfo}>
              <span>Anime • Em lançamento</span>
              <h2>Gachiakuta</h2>
              <p>Assista, avalie e acompanhe seu progresso.</p>
            </div>
          </Link>
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
              <span className={styles.sectionKicker}>Temporada atual</span>
              <h2 id="trending-title">Em alta agora</h2>
            </div>
            <Link href="/anime/gachiakuta">
              Ver temporada
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.trendingGrid}>
            {trendingTitles.map((item, index) => (
              <Link className={styles.mediaCard} href={item.href} key={item.title}>
                <div className={styles.mediaCover}>
                  <Image
                    src={item.image}
                    alt={`Capa de ${item.title}`}
                    fill
                    sizes="(max-width: 560px) 46vw, (max-width: 900px) 30vw, 220px"
                  />
                  <span className={styles.position}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.score}>★ {item.score}</span>
                </div>
                <div className={styles.mediaInfo}>
                  <h3>{item.title}</h3>
                  <p>{item.format}<span aria-hidden="true">•</span>{item.detail}</p>
                </div>
              </Link>
            ))}
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
              {discoveryTitles.map((item) => {
                const Icon = item.icon;

                return (
                  <Link className={styles.discoveryCard} href={item.href} key={item.title}>
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 30vw"
                    />
                    <div className={styles.discoveryShade} />
                    <div className={styles.discoveryContent}>
                      <span><Icon aria-hidden="true" />{item.label}</span>
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
                <li key={item.title}>
                  <Link href={item.href}>
                    <span className={styles.rankingPosition}>{index + 1}</span>
                    <Image
                      className={styles.rankingCover}
                      src={item.image}
                      alt=""
                      width={38}
                      height={54}
                    />
                    <span className={styles.rankingTitle}>
                      <strong>{item.title}</strong>
                      <small>{item.type}</small>
                    </span>
                    <span className={styles.rankingScore}>★ {item.score}</span>
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
