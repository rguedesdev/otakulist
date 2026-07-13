// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./staff.module.css";

// Icones
import { RiQuillPenLine } from "react-icons/ri";
import { PiFilmSlate } from "react-icons/pi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";

function StaffSection() {
  return (
    <section className={styles.staffContainer}>
      <h2 className={styles.staffSectionTitle}>Staff</h2>
      <div className={styles.staffCardsContainer}>
        {/* Card 1 */}
        <article className={styles.staffCard}>
          <Image
            className={styles.staffCover}
            src="/rumiko.png"
            alt="Rumiko Takahashi"
            width={60}
            height={80}
            unoptimized
            priority
          />
          <div className={styles.staffTextsContainer}>
            <div className={styles.staffTexts}>
              <h3 className={styles.mangakaName}>Takahashi Rumiko</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <RiQuillPenLine size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.staffType}>
                    Mangaka · Arte & História
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.staffCard}>
          <Image
            className={styles.staffCover}
            src="/rumiko.png"
            alt="Rumiko Takahashi"
            width={60}
            height={80}
            unoptimized
            priority
          />
          <div className={styles.staffTextsContainer}>
            <div className={styles.staffTexts}>
              <h3 className={styles.mangakaName}>Takahashi Rumiko</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <AiOutlineEdit size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.staffType}>Gensakusha · História</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.staffCard}>
          <Image
            className={styles.staffCover}
            src="/hiroyuki.png"
            alt="Hiroyuki Kitakubo"
            width={60}
            height={80}
            unoptimized
            priority
          />
          <div className={styles.staffTextsContainer}>
            <div className={styles.staffTexts}>
              <h3 className={styles.mangakaName}>Hiroyuki Kitakubo</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <PiFilmSlate size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.staffType}>Diretor</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 4 */}
        <article className={styles.staffCard}>
          <Image
            className={styles.staffCover}
            src="/hiroyuki.png"
            alt="Yuuichirou Kikuchi"
            width={60}
            height={80}
            unoptimized
            priority
          />
          <div className={styles.staffTextsContainer}>
            <div className={styles.staffTexts}>
              <h3 className={styles.mangakaName}>Yuuichirou Kikuchi</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <IoColorPaletteOutline size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.staffType}>Animador</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { StaffSection };
