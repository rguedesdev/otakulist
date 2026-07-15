// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./completedmanga.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";

function CompletedManga() {
  return (
    <section className={styles.completedMangaContainer}>
      <h2 className={styles.completedMangaSectionTitle}>Mangas finalizados</h2>
      <div className={styles.completedMangaCardsContainer}>
        {/* Card 1 */}
        <article className={styles.completedMangaCard}>
          <Image
            className={styles.completedMangaCover}
            src="/mangas/dandadan.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.completedMangaTextsContainer}>
            <div className={styles.completedMangaTexts}>
              <h3 className={styles.completedMangaTitle}>Dandadan</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Takahashi Rumiko
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 (Título Longo) */}
        <article className={styles.completedMangaCard}>
          <Image
            className={styles.completedMangaCover}
            src="/mangas/namaiki.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.completedMangaTextsContainer}>
            <div className={styles.completedMangaTexts}>
              <h3 className={styles.completedMangaTitle}>
                Namaiki na Gal Ane wo Wakaraseru Hanashi
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>Egaki Numa</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 (Com Ícone da Bilibili) */}
        <article className={styles.completedMangaCard}>
          <Image
            className={styles.completedMangaCover}
            src="/mangas/centuria.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.completedMangaTextsContainer}>
            <div className={styles.completedMangaTexts}>
              <h3 className={styles.completedMangaTitle}>Centuria</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>Kuramori Tooru</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.completedMangaInfo}>
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

export { CompletedManga };
