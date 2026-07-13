// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./season.module.css";

// Icones
import { MdOutlineVideoLibrary } from "react-icons/md";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { TbProgressCheck } from "react-icons/tb";

function SeasonSection() {
  return (
    <section className={styles.seasonsContainer}>
      <h2 className={styles.seasonSectionTitle}>Temporadas</h2>
      <div className={styles.seasonCardsContainer}>
        {/* Card 1 */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/dna.png"
            alt="Aa! Megami-sama! Season 1 Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>Aa! Megami-sama!</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>1ª Temporada</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <MdOutlineVideoLibrary size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>24 Episódios</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 24/24</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 (Título Longo) */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/dna.png"
            alt="Aa! Megami-sama! Season 2 Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>
                Aa! Megami-sama! Sorezore no Tsubasa
              </h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>2ª Temporada</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <MdOutlineVideoLibrary size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>22 Episódios</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 22/22</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 (Com Ícone da Bilibili) */}
        <article className={styles.seasonCard}>
          <Image
            className={styles.seasonCover}
            src="/dna.png"
            alt="Aa! Megami-sama! Season 3 Cover"
            width={90}
            height={130}
            unoptimized
            priority
          />
          <div className={styles.seasonTextsContainer}>
            <div className={styles.seasonTexts}>
              <h3 className={styles.seasonTitle}>Aa! Megami-sama!</h3>
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <LiaCanadianMapleLeaf size={18} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>3ª Temporada</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <MdOutlineVideoLibrary size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>12 Episódios</dd>
                </div>
                <div className={styles.infoLine}>
                  <dt className={styles.infoIcon}>
                    <TbProgressCheck size={16} aria-hidden="true" />
                  </dt>
                  <dd className={styles.seasonInfo}>Progresso: 06/12</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { SeasonSection };
