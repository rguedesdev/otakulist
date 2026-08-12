// Style Sheet CSS
import styles from "./lightnovelslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { LightNovelTrackerPanel } from "./components/LightNovelTrackerPanel/LightNovelTrackerPanel";
import type { LightNovelEntity } from "@/shared/types/entities";

// Icones
import { FaStar } from "react-icons/fa";
import { BiHash } from "react-icons/bi";
import { LuBookHeart, LuCalendarRange } from "react-icons/lu";
import { VscLibrary } from "react-icons/vsc";

function LightNovelBySlug() {
  const LightNovelInfo: LightNovelEntity = {
    cover: "/light-novels/make-heroine.jpg",
    title: "Make Heroine ga Oosugiru!",
    description:
      "Kazuhiko Nukumizu é um estudante comum, sem graça e totalmente sem amigos que, de repente, presencia uma cena inacreditável: Anna Yanami, a garota mais popular da escola, acaba de ser colocada na friendzone pelo seu amigo de infância — que também era o seu grande crush! Para completar, parece que todas as garotas populares ao seu redor estão sendo rejeitadas da mesma forma pelos garotos de quem gostam. Sem perceber, Kazuhiko acaba envolvido de cabeça em um tremendo drama de relacionamento, onde todas as principais 'heroínas' estão levando a pior no amor! Será que ele vai conseguir levantar o astral dessas garotas e ajudá-las a encontrar a felicidade?",
    entityType: "work",
    medium: "light_novel",
    score: 6.64,
    status: "Concluído",
    start: "14 Fev 1994",
    end: "21 Nov 2020",
    publisher: "Kadokawa",
    source: "Light Novel",
    genders: ["Comédia", "Romance"],
    chapters: 42,
    volumes: 7,
    publication: "Publicação por volume",
    country: "Japão",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={LightNovelInfo} />

      <div className={styles.factsBar} aria-label="Resumo da light novel">
        <div className={styles.factItem}>
          <LuBookHeart aria-hidden="true" />
          <span>
            <small>Formato</small>
            Light Novel
          </span>
        </div>
        <div className={styles.factItem}>
          <BiHash aria-hidden="true" />
          <span>
            <small>Capítulos</small>
            {LightNovelInfo.chapters} capítulos
          </span>
        </div>
        <div className={styles.factItem}>
          <VscLibrary aria-hidden="true" />
          <span>
            <small>Volumes</small>
            {LightNovelInfo.volumes} publicados
          </span>
        </div>
        <div className={styles.factItem}>
          <LuCalendarRange aria-hidden="true" />
          <span>
            <small>Publicação</small>
            {LightNovelInfo.publication}
          </span>
        </div>
        <div className={styles.factItem}>
          <FaStar aria-hidden="true" />
          <span>
            <small>Score</small>
            {LightNovelInfo.score.toFixed(2)}
          </span>
        </div>
      </div>

      <main className={styles.lightNovelSlugContainer}>
        <nav className={styles.sectionNav} aria-label="Seções da página">
          <a href="#acompanhar">Acompanhar</a>
          <a href="#personagens">Personagens</a>
          <a href="#staff">Staff</a>
          <a href="#relacionados">Relacionados</a>
        </nav>

        <div className={styles.contentContainer}>
          <div className={styles.sidebarColumn}>
            <FormatSidebarInfo entity={LightNovelInfo} />
          </div>
          <div className={styles.centralContainer}>
            <section id="acompanhar" className={styles.trackerSection}>
              <LightNovelTrackerPanel
                totalChapters={LightNovelInfo.chapters}
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

export default LightNovelBySlug;
