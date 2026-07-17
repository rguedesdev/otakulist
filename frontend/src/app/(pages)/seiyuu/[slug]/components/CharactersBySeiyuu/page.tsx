// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./charactersbyseiyuu.module.css";

// Icones
import { RiRestartLine } from "react-icons/ri";
import { RiQuillPenLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";
import { FiTv } from "react-icons/fi";

function CharacterBySeiyuu() {
  return (
    <section className={styles.characterBySeiyuuContainer}>
      <h2 className={styles.characterBySeiyuuSectionTitle}>
        Personagens dublados
      </h2>
      <div className={styles.characterBySeiyuuCardsContainer}>
        {/* Card 1 */}
        <article className={styles.characterBySeiyuuCard}>
          <Image
            className={styles.characterBySeiyuuCover}
            src="/ranma.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.characterBySeiyuuTextsContainer}>
            <div className={styles.characterBySeiyuuTexts}>
              <h3 className={styles.characterBySeiyuuTitle}>Saotome Ranma</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiTv size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>Ranma 1⁄2</dd>
                </div>

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div> */}

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.characterBySeiyuuCard}>
          <Image
            className={styles.characterBySeiyuuCover}
            src="/ranma.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.characterBySeiyuuTextsContainer}>
            <div className={styles.characterBySeiyuuTexts}>
              <h3 className={styles.characterBySeiyuuTitle}>Saotome Ranma</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiTv size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>Ranma 1⁄2</dd>
                </div>

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div> */}

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.characterBySeiyuuCard}>
          <Image
            className={styles.characterBySeiyuuCover}
            src="/ranma.jpg"
            alt="Manga Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.characterBySeiyuuTextsContainer}>
            <div className={styles.characterBySeiyuuTexts}>
              <h3 className={styles.characterBySeiyuuTitle}>Saotome Ranma</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiTv size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>Ranma 1⁄2</dd>
                </div>

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiRestartLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Ínicio: 13 Jun 1990
                  </dd>
                </div> */}

                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FaRegCheckCircle size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.characterBySeiyuuInfo}>
                    Término: 20 Abril 2004
                  </dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { CharacterBySeiyuu };
