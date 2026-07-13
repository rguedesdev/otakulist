// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./currentpublishingmanga.module.css";

// Icones
import { MdOutlineVideoLibrary } from "react-icons/md";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { TbProgressCheck } from "react-icons/tb";

import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";

function CurrentPublishingManga() {
  return (
    <section className={styles.seasonsContainer}>
      <h2 className={styles.seasonSectionTitle}>Atualmente em serialização</h2>
      <div className={styles.seasonCardsContainer}>
        {/* Card 1 */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/mangas/dandadan.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>Dandadan</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Takahashi Rumiko</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Ínicio: 13 Jun 1990</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Término: 20 Abril 2004</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 (Título Longo) */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/mangas/namaiki.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>
                Namaiki na Gal Ane wo Wakaraseru Hanashi
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Egaki Numa</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Ínicio: 13 Jun 1990</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Término: 20 Abril 2004</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 (Com Ícone da Bilibili) */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/mangas/centuria.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>Centuria</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Kuramori Tooru</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Ínicio: 13 Jun 1990</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Término: 20 Abril 2004</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { CurrentPublishingManga };
