// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./character.module.css";

// Icones
import { LiaMicrophoneSolid } from "react-icons/lia";

function CharacterSection() {
  return (
    <section className={styles.charactersContainer}>
      <h2 className={styles.characterSectionTitle}>Personagens & Seiyuus</h2>
      <div className={styles.characterCardsContainer}>
        {/* Card 1 */}
        <article className={styles.characterSeiyuuCard}>
          <Image
            className={styles.characterCover}
            src="/ranma.jpg"
            alt="Saotome Ranma"
            width={60}
            height={80}
            unoptimized
          />

          {/* Div intermediária para segurar o fundo cinza e o conteúdo de texto */}
          <div className={styles.characterInfoContainer}>
            <dl className={styles.infoGroup}>
              <div className={styles.infoLine}>
                <dd className={styles.characterName}>Saotome Ranma</dd>
              </div>
              <div className={styles.infoLine}>
                <dt>
                  <LiaMicrophoneSolid size={17} aria-hidden="true" />
                </dt>
                <dd className={styles.seiyuuName}>Yamaguchi Kappei</dd>
              </div>
            </dl>
          </div>

          <Image
            className={styles.seiyuuCover}
            src="/yamaguchi.png"
            alt="Yamaguchi Kappei"
            width={60}
            height={80}
            unoptimized
          />
        </article>

        {/* Card 2 */}
        <article className={styles.characterSeiyuuCard}>
          <Image
            className={styles.characterCover}
            src="/ranma.jpg"
            alt="Saotome Ranma"
            width={60}
            height={80}
            unoptimized
          />

          <div className={styles.characterInfoContainer}>
            <dl className={styles.infoGroup}>
              <div className={styles.infoLine}>
                <dd className={styles.characterName}>Saotome Ranma</dd>
              </div>
              <div className={styles.infoLine}>
                <dt>
                  <LiaMicrophoneSolid size={17} aria-hidden="true" />
                </dt>
                <dd className={styles.seiyuuName}>Yamaguchi Kappei</dd>
              </div>
            </dl>
          </div>

          <Image
            className={styles.seiyuuCover}
            src="/yamaguchi.png"
            alt="Yamaguchi Kappei"
            width={60}
            height={80}
            unoptimized
          />
        </article>

        {/* Card 3 */}
        <article className={styles.characterSeiyuuCard}>
          <Image
            className={styles.characterCover}
            src="/ranma.jpg"
            alt="Saotome Ranma"
            width={60}
            height={80}
            unoptimized
          />

          <div className={styles.characterInfoContainer}>
            <dl className={styles.infoGroup}>
              <div className={styles.infoLine}>
                <dd className={styles.characterName}>Saotome Ranma</dd>
              </div>
              <div className={styles.infoLine}>
                <dt>
                  <LiaMicrophoneSolid size={17} aria-hidden="true" />
                </dt>
                <dd className={styles.seiyuuName}>Yamaguchi Kappei</dd>
              </div>
            </dl>
          </div>

          <Image
            className={styles.seiyuuCover}
            src="/yamaguchi.png"
            alt="Yamaguchi Kappei"
            width={60}
            height={80}
            unoptimized
          />
        </article>
      </div>
    </section>
  );
}

export { CharacterSection };
