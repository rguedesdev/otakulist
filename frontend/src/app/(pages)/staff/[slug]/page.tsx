// Style Sheet CSS
import styles from "./staffslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { AnimesByStaff } from "./components/AnimesByStaff/page";

function StaffBySlug() {
  const StaffInfo = {
    cover: "/hiroyuki.png",
    name_romaji: "Kitakubo Hiroyuki",
    name_kanji: "北久保弘之",
    hometown: "Tokyo, Japão",
    description:
      "Takahashi Rumiko (ou Rumiko Takahashi no ocidente) é uma das mulheres mais ricas do Japão. Os mangás que ela cria (e suas adaptações para anime) são muito populares nos Estados Unidos e na Europa, onde foram lançados em inglês em ambos os formatos. Suas obras são mundialmente conhecidas, e muitas de suas séries figuraram entre os primeiros mangás lançados em inglês na década de 1990. Takahashi também é a autora de quadrinhos mais vendida da história; mais de 100 milhões de exemplares de suas diversas obras já foram comercializados.",
    format: "staff",
    date_of_birth: "15 Nov 1963",
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={StaffInfo} />
      <main className={styles.staffSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={StaffInfo} />
          <div className={styles.centralContainer}>
            <AnimesByStaff />
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffBySlug;
