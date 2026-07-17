// Style Sheet CSS
import styles from "./mangakaslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { MangasByMangaka } from "./components/MangasByMangaka/page";
import { AnimesByMangaka } from "./components/AnimesByMangaka/page";

function MangakaBySlug() {
  const MangakaInfo = {
    cover: "/rumiko.png",
    name_romaji: "Takahashi Rumiko",
    name_kanji: "高橋留美子",
    hometown: "Niigata, Japão",
    description:
      "Takahashi Rumiko (ou Rumiko Takahashi no ocidente) é uma das mulheres mais ricas do Japão. Os mangás que ela cria (e suas adaptações para anime) são muito populares nos Estados Unidos e na Europa, onde foram lançados em inglês em ambos os formatos. Suas obras são mundialmente conhecidas, e muitas de suas séries figuraram entre os primeiros mangás lançados em inglês na década de 1990. Takahashi também é a autora de quadrinhos mais vendida da história; mais de 100 milhões de exemplares de suas diversas obras já foram comercializados.",
    format: "mangaka",
    date_of_birth: "10 Out 1957",
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={MangakaInfo} />
      <main className={styles.mangakaSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={MangakaInfo} />
          <div className={styles.centralContainer}>
            <MangasByMangaka />
            <AnimesByMangaka />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MangakaBySlug;
