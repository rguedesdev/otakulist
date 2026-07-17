// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./animesbystaff.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";
import { PiFilmSlate } from "react-icons/pi";

function AnimesByStaff() {
  return (
    <section className={styles.animesByStaffContainer}>
      <h2 className={styles.animesByStaffSectionTitle}>Animes</h2>
      <div className={styles.animesByStaffCardsContainer}>
        {/* Card 1 */}
        <article className={styles.animesByStaffCard}>
          <Image
            className={styles.animesByStaffCover}
            src="/animes/mao2.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStaffTextsContainer}>
            <div className={styles.animesByStaffTexts}>
              <h3 className={styles.animesByStaffTitle}>MAO</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiFilmSlate size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Diretor (eps 1~12)
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.animesByStaffCard}>
          <Image
            className={styles.animesByStaffCover}
            src="/animes/rinne2.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStaffTextsContainer}>
            <div className={styles.animesByStaffTexts}>
              <h3 className={styles.animesByStaffTitle}>Kyoukai no Rinne</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiFilmSlate size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>Criador Original</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.animesByStaffCard}>
          <Image
            className={styles.animesByStaffCover}
            src="/animes/inuyasha2.png"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.animesByStaffTextsContainer}>
            <div className={styles.animesByStaffTexts}>
              <h3 className={styles.animesByStaffTitle}>InuYasha</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiFilmSlate size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>Criador Original</dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div>

                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.animesByStaffInfo}>
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

export { AnimesByStaff };
