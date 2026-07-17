// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./animesbystudio.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";
import { LiaCanadianMapleLeaf } from "react-icons/lia";

function AnimesByStudio() {
  return (
    <section className={styles.animesByStudioContainer}>
      <h2 className={styles.animesByStudioSectionTitle}>Animes</h2>
      <div className={styles.animesByStudioCardsContainer}>
        {/* Card 1 */}
        <article className={styles.animesByStudioCard}>
          <Image
            className={styles.animesByStudioCover}
            src="/animes/gachiakuta.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStudioTextsContainer}>
            <div className={styles.animesByStudioTexts}>
              <h3 className={styles.animesByStudioTitle}>Gachiakuta</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Temporada: Inverno 2025
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.animesByStudioCard}>
          <Image
            className={styles.animesByStudioCover}
            src="/animes/baby.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStudioTextsContainer}>
            <div className={styles.animesByStudioTexts}>
              <h3 className={styles.animesByStudioTitle}>
                Baby I Love You Daze
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Temporada: Outono 2012
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.animesByStudioCard}>
          <Image
            className={styles.animesByStudioCover}
            src="/animes/wolfs.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStudioTextsContainer}>
            <div className={styles.animesByStudioTexts}>
              <h3 className={styles.animesByStudioTitle}>Wolf's Rain</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Temporada: Verão 2005
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStudioInfo}>
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

export { AnimesByStudio };
