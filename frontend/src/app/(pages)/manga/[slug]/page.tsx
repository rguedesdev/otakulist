// Style Sheet CSS
import styles from "./mangaslug.module.css";

// Components
import { HeroSection } from "@/components/HeroSection/page";
import { FormatSidebarInfo } from "@/components/FormatSidebarInfo/page";
import { SeasonSection } from "@/components/SeasonSection/page";
import { CharacterSection } from "@/components/CharacterSection/page";
import { StaffSection } from "@/components/StaffSection/page";
import { RelatedSection } from "@/components/RelatedSection/page";

function MangaBySlug() {
  const MangaInfo = {
    cover: "/mangas/dandadan.jpg",
    title: "Dandadan",
    description:
      "Dandadan acompanha Momo, uma garota que acredita em fantasmas, e Okarun, um garoto obcecado por alienígenas. Para provar quem está certo, eles exploram locais assombrados e ruínas. O que era uma aposta se torna uma caótica aventura de ação, terror e romance quando eles despertam superpoderes e enfrentam alienígenas e espíritos.",
    format: "Manga",
    status: "Em andamento",
    start: "13 Jun 1990",
    end: "21 Dez 2023",
    magazine: "Shounen Jump",
    publisher: "Shueisha",
    source: "Manga",
    demography: "Shounen",
    genders: ["Drama", "Comédia", "Ação"],
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={MangaInfo} />
      <main className={styles.mangaSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={MangaInfo} />
          <div>
            <CharacterSection />
            <StaffSection />
            <RelatedSection />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MangaBySlug;
