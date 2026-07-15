// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./magazinesbypublisher.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";

import { PiTargetFill } from "react-icons/pi";
import { LuCalendarRange } from "react-icons/lu";

function MagazinesByPublisher() {
  return (
    <section className={styles.magazinesByPublisherContainer}>
      <h2 className={styles.magazinesByPublisherSectionTitle}>
        Magazines publicadas
      </h2>
      <div className={styles.magazinesByPublisherCardsContainer}>
        {/* Card 1 */}
        <article className={styles.magazinesByPublisherCard}>
          <Image
            className={styles.magazinesByPublisherCover}
            src="/mangas/shounen-jump.jpg"
            alt="Magazine Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.magazinesByPublisherTextsContainer}>
            <div className={styles.magazinesByPublisherTexts}>
              <h3 className={styles.magazinesByPublisherTitle}>
                Weekly Shounen Jump
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiTargetFill size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Demografia: Shounen
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LuCalendarRange size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Periodicidade: Semanal
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 (Título Longo) */}
        <article className={styles.magazinesByPublisherCard}>
          <Image
            className={styles.magazinesByPublisherCover}
            src="/mangas/young-jump.jpg"
            alt="Magazine Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.magazinesByPublisherTextsContainer}>
            <div className={styles.magazinesByPublisherTexts}>
              <h3 className={styles.magazinesByPublisherTitle}>
                Weekly Young Jump
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiTargetFill size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Demografia: Seinen
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LuCalendarRange size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Periodicidade: Semanal
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 (Com Ícone da Bilibili) */}
        <article className={styles.magazinesByPublisherCard}>
          <Image
            className={styles.magazinesByPublisherCover}
            src="/mangas/betsuma.jpg"
            alt="Magazine Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.magazinesByPublisherTextsContainer}>
            <div className={styles.magazinesByPublisherTexts}>
              <h3 className={styles.magazinesByPublisherTitle}>
                Bessatsu Margaret
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiTargetFill size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Demografia: Shoujo
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LuCalendarRange size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.magazinesByPublisherInfo}>
                    Periodicidade: Semanal
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

export { MagazinesByPublisher };
