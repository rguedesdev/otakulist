// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./anisong.module.css";

// Icones
import { RiQuillPenLine } from "react-icons/ri";
import { PiFilmSlate } from "react-icons/pi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";

import { MdOutlineVideoLibrary } from "react-icons/md";
import { TbProgressCheck } from "react-icons/tb";

import { RiDiscLine } from "react-icons/ri";
import { FiMusic } from "react-icons/fi";

import { TbMicrophone2 } from "react-icons/tb";

function AnisongSection() {
  return (
    <section className={styles.anisongContainer}>
      <h2 className={styles.anisongSectionTitle}>Anisong</h2>
      <div className={styles.anisongCardsContainer}>
        {/* Card 1 */}
        <article className={styles.anisongCard}>
          <Image
            className={styles.anisongCover}
            src="/singers/yui-horie.png"
            alt="Yui Horie"
            width={60}
            height={80}
            unoptimized
            priority
          />

          <div className={styles.anisongTextsContainer}>
            <div className={styles.anisongTexts}>
              <h3 className={styles.anisongTitle}>Opening 1 (eps 1~12)</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiMusic size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>Scramble</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbMicrophone2 size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>
                    Yui Horie feat. Unscandal
                  </dd>
                </div>
                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 24/24</dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>
        {/* Card 2 */}
        <article className={styles.anisongCard}>
          <Image
            className={styles.anisongCover}
            src="/singers/ami-yokito.jpg"
            alt="Yui Horie"
            width={60}
            height={80}
            unoptimized
            priority
          />

          <div className={styles.anisongTextsContainer}>
            <div className={styles.anisongTexts}>
              <h3 className={styles.anisongTitle}>Opening 2 (eps 12~24)</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiMusic size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>Sentimental Generation</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbMicrophone2 size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>Ami Tokito</dd>
                </div>
                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 24/24</dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>
        {/* Card 3 */}
        <article className={styles.anisongCard}>
          <Image
            className={styles.anisongCover}
            src="/singers/yuko-ogura.jpg"
            alt="Yui Horie"
            width={60}
            height={80}
            unoptimized
            priority
          />

          <div className={styles.anisongTextsContainer}>
            <div className={styles.anisongTexts}>
              <h3 className={styles.anisongTitle}>Ending 1 (eps 1~12)</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <FiMusic size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>Onna no ko Otoko no ko</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbMicrophone2 size={13} aria-hidden="true" />
                  </dt>
                  <dd className={styles.anisongInfo}>Yuko Ogura </dd>
                </div>
                {/* <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={14} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 24/24</dd>
                </div> */}
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { AnisongSection };
