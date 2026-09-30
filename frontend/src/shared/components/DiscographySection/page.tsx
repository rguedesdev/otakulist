import Image from "next/image";

import { FiCalendar, FiDisc } from "react-icons/fi";
import { MdOutlineLibraryMusic } from "react-icons/md";

import styles from "./discographysection.module.css";

type DiscographyRelease = {
  title: string;
  releaseType: string;
  year: string;
  tracks: number;
  cover: string;
};

type DiscographySectionProps = {
  releases: DiscographyRelease[];
  title?: string;
};

function DiscographySection({ releases, title = "Discografia" }: DiscographySectionProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.cardsContainer}>
        {releases.map((release) => (
          <article
            className={styles.card}
            key={`${release.title}-${release.year}-${release.releaseType}`}
            aria-label={`${release.title}, ${release.releaseType} de ${release.year}`}
          >
            <Image
              className={styles.cover}
              src={release.cover}
              alt={`Capa de ${release.title}`}
              width={100}
              height={100}
              unoptimized
            />
            <div className={styles.texts}>
              <h3>{release.title}</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt><FiDisc size={12} aria-hidden="true" /></dt>
                  <dd>{release.releaseType}</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt><FiCalendar size={12} aria-hidden="true" /></dt>
                  <dd>{release.year}</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt><MdOutlineLibraryMusic size={12} aria-hidden="true" /></dt>
                  <dd>{release.tracks} faixas</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { DiscographySection };
export type { DiscographyRelease };
