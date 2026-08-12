// Style Sheet CSS
import styles from "./animeslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { SeasonSection } from "@/shared/components/SeasonSection/page";
import type { AnimeSeason } from "@/shared/components/SeasonSection/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { AnisongSection } from "@/shared/components/AnisongSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { AnimeTrackerPanel } from "./components/AnimeTrackerPanel/AnimeTrackerPanel";
import type { AnimeEntity } from "@/shared/types/entities";
import {
  formatAnimeReleaseFormats,
  getUniqueAnimeReleaseFormats,
} from "@/shared/types/entities";

// Icones
import { FiActivity, FiClock } from "react-icons/fi";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { PiTelevisionSimple } from "react-icons/pi";
import { FaStar } from "react-icons/fa";

function AnimeBySlug() {
  const animeSeasons: AnimeSeason[] = [
    {
      id: 1,
      title: "Aa! Megami-sama!",
      label: "1ª Temporada",
      cover: "/dna.png",
      episodes: 24,
      watchedEpisodes: 24,
      status: "Concluído",
      releaseFormat: "tv",
      start: "06 Jan 2005",
      end: "07 Jul 2005",
      duration: "24 min por episódio",
      studio: "AIC",
      director: "Hiroaki Gohda",
      broadcastSeason: "Inverno 2005",
      source: "Manga",
      synopsis:
        "Primeira parte da adaptação para televisão, apresentando o encontro de Keiichi Morisato com Belldandy e o início da convivência entre humanos e deusas.",
    },
    {
      id: 2,
      title: "Aa! Megami-sama! Sorezore no Tsubasa",
      label: "2ª Temporada",
      cover: "/dna.png",
      episodes: 22,
      watchedEpisodes: 22,
      status: "Concluído",
      releaseFormat: "ova",
      start: "06 Abr 2006",
      end: "14 Set 2006",
      duration: "24 min por episódio",
      studio: "AIC",
      director: "Hiroaki Gohda",
      broadcastSeason: "Primavera 2006",
      source: "Manga",
      synopsis:
        "A segunda temporada aprofunda a relação de Keiichi e Belldandy e apresenta novos conflitos envolvendo o mundo celestial e seus habitantes.",
    },
    {
      id: 3,
      title: "Aa! Megami-sama!",
      label: "3ª Temporada",
      cover: "/dna.png",
      episodes: 12,
      watchedEpisodes: 6,
      status: "Em andamento",
      releaseFormat: "tv",
      start: "08 Jan 2007",
      end: "26 Mar 2007",
      duration: "24 min por episódio",
      studio: "AIC",
      director: "Hiroaki Gohda",
      broadcastSeason: "Inverno 2007",
      source: "Manga",
      synopsis:
        "Continuação da história central com novos episódios dedicados às deusas e às consequências das mudanças ocorridas nas temporadas anteriores.",
    },
  ];

  const AnimeInfo: AnimeEntity = {
    cover: "/animes/mayonaka.jpg",
    title: "Mayonaka Heart Tune",
    description:
      "Yamabuki Arisu busca por 'Apollo', uma misteriosa locutora de rádio que confortou suas noites solitárias antes de desaparecer. No clube de rádio do ensino médio, ele encontra quatro garotas com grandes ambições vocais e tenta descobrir qual delas é seu antigo amor.",
    entityType: "work",
    medium: "anime",
    episodes: animeSeasons.reduce(
      (total, season) => total + season.episodes,
      0,
    ),
    status: "Em exibição",
    start: "13 Jun 1990",
    end: "21 Dez 2023",
    season: "Inverno 2004",
    studio: "Bones",
    producers: ["Bandai Visual", "TBS"],
    source: "Manga",
    demography: "Shounen",
    genders: ["Drama", "Comédia", "Ação"],
    duration: "24 min por episódio",
    score: 6.64,
    rating: "PG-13",
    country: "Japão",
  };

  const animeReleaseFormats = getUniqueAnimeReleaseFormats(
    animeSeasons.map((season) => season.releaseFormat),
  );

  return (
    <div className={styles.page}>
      <HeroSection entity={AnimeInfo} />

      <div className={styles.factsBar} aria-label="Resumo do anime">
        <div className={styles.factItem}>
          <PiTelevisionSimple aria-hidden="true" />
          <span>
            <small>Formato</small>
            {formatAnimeReleaseFormats(animeReleaseFormats)}
          </span>
        </div>
        <div className={styles.factItem}>
          <MdOutlineVideoLibrary aria-hidden="true" />
          <span>
            <small>Episódios</small>
            {AnimeInfo.episodes} episódios
          </span>
        </div>
        <div className={styles.factItem}>
          <FiClock aria-hidden="true" />
          <span>
            <small>Duração</small>
            {AnimeInfo.duration}
          </span>
        </div>
        <div className={styles.factItem}>
          <FiActivity aria-hidden="true" />
          <span>
            <small>Status</small>
            {AnimeInfo.status}
          </span>
        </div>
        <div className={styles.factItem}>
          <FaStar aria-hidden="true" />
          <span>
            <small>Score</small>
            {AnimeInfo.score.toFixed(2)}
          </span>
        </div>
      </div>

      <main className={styles.animeSlugContainer}>
        <nav className={styles.sectionNav} aria-label="Seções da página">
          <a href="#acompanhar">Acompanhar</a>
          <a href="#temporadas">Temporadas</a>
          <a href="#personagens">Personagens</a>
          <a href="#staff">Staff</a>
          <a href="#musicas">Músicas</a>
          <a href="#relacionados">Relacionados</a>
        </nav>

        <div className={styles.contentContainer}>
          <div className={styles.sidebarColumn}>
            <FormatSidebarInfo entity={AnimeInfo} />
          </div>
          <div className={styles.centralContainer}>
            <section id="acompanhar" className={styles.trackerSection}>
              <AnimeTrackerPanel seasons={animeSeasons} isAuthenticated />
            </section>

            <div id="temporadas" className={styles.contentSection}>
              <SeasonSection seasons={animeSeasons} />
            </div>
            <div id="personagens" className={styles.contentSection}>
              <CharacterSection />
            </div>
            <div id="staff" className={styles.contentSection}>
              <StaffSection />
            </div>
            <div id="musicas" className={styles.contentSection}>
              <AnisongSection />
            </div>
            <div id="relacionados" className={styles.contentSection}>
              <RelatedSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnimeBySlug;
