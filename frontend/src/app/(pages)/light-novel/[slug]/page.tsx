// Style Sheet CSS
import styles from "./lightnovelslug.module.css";

// Components
import { HeroSection } from "@/components/HeroSection/page";
import { FormatSidebarInfo } from "@/components/FormatSidebarInfo/page";
import { SeasonSection } from "@/components/SeasonSection/page";
import { CharacterSection } from "@/components/CharacterSection/page";
import { StaffSection } from "@/components/StaffSection/page";
import { RelatedSection } from "@/components/RelatedSection/page";

function LightNovelBySlug() {
  const LightNovelInfo = {
    format: "Light Novel",
    status: "Concluído",
    start: "14 Fev 1994",
    end: "21 Nov 2020",
    publisher: "Kadokawa",
    source: "Light Novel",
    genders: ["Drama", "Comédia", "Ação"],
  };

  return (
    <div className={styles.page}>
      <HeroSection />
      <main className={styles.lightNovelSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={LightNovelInfo} />
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

export default LightNovelBySlug;
