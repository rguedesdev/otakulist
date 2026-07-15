// Style Sheet CSS
import styles from "./publisherslug.module.css";

// Components
import { HeroSection } from "@/shared/components/HeroSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { MagazinesByPublisher } from "./components/MagazinesByPublisher/page";

function MagazineBySlug() {
  const PublisherInfo = {
    cover: "/mangas/shueisha.png",
    title: "Shueisha",
    description: "A Shueisha é a maior e mais importante editora japonesa.",
    format: "publisher",
    foundation: "13 Jun 1990",
  };

  return (
    <div className={styles.page}>
      <HeroSection FormatInfo={PublisherInfo} />
      <main className={styles.publisherSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo FormatInfo={PublisherInfo} />
          <div className={styles.centralContainer}>
            <MagazinesByPublisher />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MagazineBySlug;
