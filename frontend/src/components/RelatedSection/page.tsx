// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./related.module.css";

function RelatedSection() {
  return (
    <section className={styles.relatedContainer}>
      <h2 className={styles.relatedSectionTitle}>Relacionados</h2>
      <div className={styles.relatedCardsContainer}>
        {/* Card 1 */}
        <article className={styles.relatedCard}>
          <Image
            className={styles.relatedCover}
            src="/dna-manga.jpg"
            alt="Aa! Megami-sama! Cover"
            width={75}
            height={110}
            unoptimized
            priority
          />
          <div className={styles.relatedTextsContainer}>
            <div className={styles.relatedTexts}>
              {/* Bloco Superior (Título da Relação + Nome da Obra) */}
              <div className={styles.topTexts}>
                <dl className={styles.infoGroup}>
                  <div className={styles.infoLine}>
                    <dd className={styles.relatedTitle}>Aa! Megami-sama!</dd>
                  </div>
                </dl>
              </div>

              {/* Bloco Inferior (Status / Mídia) */}
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dd className={styles.info}>Manga · Finalizado</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className={styles.relatedCard}>
          <Image
            className={styles.relatedCover}
            src="/dna.png"
            alt="Aa! Megami-sama! Cover"
            width={75}
            height={110}
            unoptimized
            priority
          />
          <div className={styles.relatedTextsContainer}>
            <div className={styles.relatedTexts}>
              {/* Bloco Superior (Título da Relação + Nome da Obra) */}
              <div className={styles.topTexts}>
                <dl className={styles.infoGroup}>
                  <div className={styles.infoLine}>
                    <dd className={styles.relatedTitle}>
                      Aa! Megami-sama! Sorezore no Tsubasa
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Bloco Inferior (Status / Mídia) */}
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dd className={styles.info}>OVA · Finalizado</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className={styles.relatedCard}>
          <Image
            className={styles.relatedCover}
            src="/dna.png"
            alt="Aa! Megami-sama! Cover"
            width={75}
            height={110}
            unoptimized
            priority
          />
          <div className={styles.relatedTextsContainer}>
            <div className={styles.relatedTexts}>
              {/* Bloco Superior (Título da Relação + Nome da Obra) */}
              <div className={styles.topTexts}>
                <dl className={styles.infoGroup}>
                  <div className={styles.infoLine}>
                    <dd className={styles.relatedTitle}>
                      Aa! Megami-sama! Sorezore no Tsubasa
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Bloco Inferior (Status / Mídia) */}
              <dl className={styles.infoGroup}>
                <div className={styles.infoLine}>
                  <dd className={styles.info}>Filme · Finalizado</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { RelatedSection };
