// Style Sheet CSS
import styles from "./animeslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { SeasonSection } from "@/shared/components/SeasonSection/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { AnisongSection } from "@/shared/components/AnisongSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";

function AnimeBySlug() {
  const AnimeInfo = {
    cover: "/animes/mayonaka.jpg",
    title: "Mayonaka Heart Tune",
    description:
      "Yamabuki Arisu busca por 'Apollo', uma misteriosa locutora de rádio que confortou suas noites solitárias antes de desaparecer. No clube de rádio do ensino médio, ele encontra quatro garotas com grandes ambições vocais e tenta descobrir qual delas é seu antigo amor.",
    format: "anime",
    episodes: 24,
    status: "Em exibição",
    start: "13 Jun 1990",
    end: "21 Dez 2023",
    season: "Inverno 2004",
    studio: "Bones",
    producers: ["Bandai Visual", "TBS"],
    source: "Manga",
    demography: "Shounen",
    genders: ["Drama", "Comédia", "Ação"],
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={AnimeInfo} />
      <main className={styles.animeSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={AnimeInfo} />
          <div className={styles.centralContainer}>
            <SeasonSection />
            <CharacterSection />
            <StaffSection />
            <AnisongSection />
            <RelatedSection />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnimeBySlug;
