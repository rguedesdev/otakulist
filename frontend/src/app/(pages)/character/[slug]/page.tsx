// Style Sheet CSS
import styles from "./characterslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import type { CharacterEntity } from "@/shared/types/entities";
import { CharacterByMedia } from "./components/CharactersByAnime/page";

function CharacterBySlug() {
  const CharacterInfo: CharacterEntity = {
    cover: "/ranma.jpg",
    name_romaji: "Saotome Ranma",
    name_kanji: "鬼頭明里",
    hometown: "Nagoya, Japão ",
    description:
      "Lilithea is one of main characters of Killed Again, Mr Detective? She's a 16 years-old girl who serves as Sakuya's assistant, helping him with cases. She's a very beautiful girl with a nice figure, silver hair, and purple eyes. She's quite observant and capable at her job, yet tends to give into temptations to have fun while on the job. She cares deeply for Sakuya, and is quite possessive of him, getting jealous when he interacts with other women.",
    entityType: "character",
    date_of_birth: "16 Out 1994",
  };

  return (
    <div className={styles.page}>
      <HeroSection entity={CharacterInfo} />
      <main className={styles.characterSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={CharacterInfo} />
          <div className={styles.centralContainer}>
            <CharacterByMedia />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CharacterBySlug;
