// Style Sheet CSS
import styles from "./magazineslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { CurrentPublishingManga } from "./components/CurrentPublishingManga/page";
import { CompletedManga } from "./components/CompletedManga/page";
import type { PublicationEntity } from "@/shared/types/entities";

function MagazineBySlug() {
  const MagazineInfo: PublicationEntity = {
    cover: "/mangas/shounen-jump.jpg",
    title: "Weekly Shounen Jump",
    description:
      "A Weekly Shounen Jump é a maior e mais famosa antologia semanal de mangas do Japão, publicada desde 1968 pela editora Shueisha. Focada no público jovem masculino (a partir de 12 anos), destaca-se por histórias focadas em ação, comédia e pelo lema 'amizade, esforço e vitória'.",
    entityType: "publication",
    publicationType: "magazine",
    foundation: "13 Jun 1990",
    publisher: "Shueisha",
    demography: "Shounen",
    frequency: "Semanal",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={MagazineInfo} />
      <main className={styles.magazineSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={MagazineInfo} />
          <div className={styles.centralContainer}>
            <CurrentPublishingManga />
            <CompletedManga />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MagazineBySlug;
