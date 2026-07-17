// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./mangasbymangaka.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";

function MangasByMangaka() {
  return (
    <section className={styles.mangasByMangakaContainer}>
      <h2 className={styles.mangasByMangakaSectionTitle}>Mangas</h2>
      <div className={styles.mangasByMangakaCardsContainer}>
        {/* Card 1 */}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/mao.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>MAO</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/rinne.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>Kyoukai no Rinne</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3*/}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/inuyasha.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>InuYasha</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 4 */}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/ranma.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>Ranma ½</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 5 */}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/maison-ikkoku.png"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>Maison Ikkoku</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 6 */}
        <article className={styles.mangasByMangakaCard}>
          <Image
            className={styles.mangasByMangakaCover}
            src="/mangas/urusei-yatsura.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.mangasByMangakaTextsContainer}>
            <div className={styles.mangasByMangakaTexts}>
              <h3 className={styles.mangasByMangakaTitle}>Urusei Yatsura</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Mangaka · Arte & História
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.mangasByMangakaInfo}>
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

export { MangasByMangaka };
