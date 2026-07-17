// Style Sheet CSS
import styles from "./seiyuuslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { CharacterBySeiyuu } from "./components/CharactersBySeiyuu/page";

function StaffBySlug() {
  const SeiyuuInfo = {
    cover: "/kitou.jpg",
    name_romaji: "Kitou Akari",
    name_kanji: "鬼頭明里",
    hometown: "Nagoya, Japão ",
    description:
      "A Japanese voice actress. She debuted in 2014, got her first main role in Time Bokan 24 (2016), and has since received more leading roles. On October 16, 2019, her 25th birthday, she made her debut as a solo music artist under Pony Canyon. After the agency Pro-Fit shut down their operations, she joined the new agency Racoon Dog on 2022. ",
    format: "seiyuu",
    date_of_birth: "16 Out 1994",
    agency: "Raccoon Dog",
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={SeiyuuInfo} />
      <main className={styles.seiyuuSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={SeiyuuInfo} />
          <div className={styles.centralContainer}>
            <CharacterBySeiyuu />
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffBySlug;
