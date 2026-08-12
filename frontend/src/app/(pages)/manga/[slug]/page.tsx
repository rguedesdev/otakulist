// Style Sheet CSS
import styles from "./mangaslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { MangaTrackerPanel } from "./components/MangaTrackerPanel/MangaTrackerPanel";
import type { MangaEntity } from "@/shared/types/entities";

// Icones
import { FaStar } from "react-icons/fa";
import { GiEvilBook } from "react-icons/gi";
import { BiHash } from "react-icons/bi";
import { VscLibrary } from "react-icons/vsc";
import { LuCalendarRange } from "react-icons/lu";

function MangaBySlug() {
  const MangaInfo: MangaEntity = {
    cover: "/mangas/dandadan.jpg",
    title: "Dandadan",
    description:
      "Dandadan acompanha Momo, uma garota que acredita em fantasmas, e Okarun, um garoto obcecado por alienígenas. Para provar quem está certo, eles exploram locais assombrados e ruínas. O que era uma aposta se torna uma caótica aventura de ação, terror e romance quando eles despertam superpoderes e enfrentam alienígenas e espíritos.",
    entityType: "work",
    medium: "manga",
    score: 6.64,
    status: "Em andamento",
    start: "13 Jun 1990",
    end: "21 Dez 2023",
    magazine: "Shounen Jump",
    publisher: "Shueisha",
    source: "Manga",
    demography: "Shounen",
    genders: ["Drama", "Comédia", "Ação"],
    chapters: 189,
    volumes: 22,
    serialization: "Publicação semanal",
    country: "Japão",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={MangaInfo} />

      <div className={styles.factsBar} aria-label="Resumo do manga">
        <div className={styles.factItem}>
          <GiEvilBook aria-hidden="true" />
          <span>
            <small>Formato</small>
            Manga
          </span>
        </div>
        <div className={styles.factItem}>
          <BiHash aria-hidden="true" />
          <span>
            <small>Capítulos</small>
            {MangaInfo.chapters} capítulos
          </span>
        </div>
        <div className={styles.factItem}>
          <VscLibrary aria-hidden="true" />
          <span>
            <small>Volumes</small>
            {MangaInfo.volumes} publicados
          </span>
        </div>
        <div className={styles.factItem}>
          <LuCalendarRange aria-hidden="true" />
          <span>
            <small>Serialização</small>
            {MangaInfo.serialization}
          </span>
        </div>
        <div className={styles.factItem}>
          <FaStar aria-hidden="true" />
          <span>
            <small>Score</small>
            {MangaInfo.score.toFixed(2)}
          </span>
        </div>
      </div>

      <main className={styles.mangaSlugContainer}>
        <nav className={styles.sectionNav} aria-label="Seções da página">
          <a href="#acompanhar">Acompanhar</a>
          <a href="#personagens">Personagens</a>
          <a href="#staff">Staff</a>
          <a href="#relacionados">Relacionados</a>
        </nav>

        <div className={styles.contentContainer}>
          <div className={styles.sidebarColumn}>
            <FormatSidebarInfo entity={MangaInfo} />
          </div>
          <div className={styles.centralContainer}>
            <section id="acompanhar" className={styles.trackerSection}>
              <MangaTrackerPanel
                totalChapters={MangaInfo.chapters}
                isAuthenticated
              />
            </section>

            <div id="personagens" className={styles.contentSection}>
              <CharacterSection />
            </div>
            <div id="staff" className={styles.contentSection}>
              <StaffSection />
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

export default MangaBySlug;
