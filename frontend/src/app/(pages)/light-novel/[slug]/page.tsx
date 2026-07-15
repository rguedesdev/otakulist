// Style Sheet CSS
import styles from "./lightnovelslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { SeasonSection } from "@/shared/components/SeasonSection/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";

function LightNovelBySlug() {
  const LightNovelInfo = {
    cover: "/light-novels/make-heroine.jpg",
    title: "Make Heroine ga Oosugiru!",
    description:
      "Kazuhiko Nukumizu é um estudante comum, sem graça e totalmente sem amigos que, de repente, presencia uma cena inacreditável: Anna Yanami, a garota mais popular da escola, acaba de ser colocada na friendzone pelo seu amigo de infância — que também era o seu grande crush! Para completar, parece que todas as garotas populares ao seu redor estão sendo rejeitadas da mesma forma pelos garotos de quem gostam. Sem perceber, Kazuhiko acaba envolvido de cabeça em um tremendo drama de relacionamento, onde todas as principais 'heroínas' estão levando a pior no amor! Será que ele vai conseguir levantar o astral dessas garotas e ajudá-las a encontrar a felicidade?",
    format: "light_novel",
    status: "Concluído",
    start: "14 Fev 1994",
    end: "21 Nov 2020",
    publisher: "Kadokawa",
    source: "Light Novel",
    genders: ["Comédia", "Romance"],
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={LightNovelInfo} />
      <main className={styles.lightNovelSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={LightNovelInfo} />
          <div className={styles.centralContainer}>
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
