// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./animesbymangaka.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";

function AnimesByMangaka() {
  return (
    <section className={styles.animesByMangakaContainer}>
      <h2 className={styles.animesByMangakaSectionTitle}>Animes</h2>
      <div className={styles.animesByMangakaCardsContainer}>
        {/* Card 1 */}
        <article className={styles.animesByMangakaCard}>
          <Image
            className={styles.animesByMangakaCover}
            src="/animes/mao2.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByMangakaTextsContainer}>
            <div className={styles.animesByMangakaTexts}>
              <h3 className={styles.animesByMangakaTitle}>MAO</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Criador Original
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.animesByMangakaCard}>
          <Image
            className={styles.animesByMangakaCover}
            src="/animes/rinne2.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByMangakaTextsContainer}>
            <div className={styles.animesByMangakaTexts}>
              <h3 className={styles.animesByMangakaTitle}>Kyoukai no Rinne</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Criador Original
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.animesByMangakaCard}>
          <Image
            className={styles.animesByMangakaCover}
            src="/animes/inuyasha2.png"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByMangakaTextsContainer}>
            <div className={styles.animesByMangakaTexts}>
              <h3 className={styles.animesByMangakaTitle}>InuYasha</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Criador Original
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { AnimesByMangaka };
