// Imports Principais
import type { SeiyuuCharacterCredit } from "../../data";
import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/shared/auth/api";

// Style Sheet CSS
import styles from "./charactersbyseiyuu.module.css";

// Icones
import { FiTv } from "react-icons/fi";

type CharacterBySeiyuuProps = {
  characters: SeiyuuCharacterCredit[];
};

function CharacterBySeiyuu({ characters }: CharacterBySeiyuuProps) {
  return (
    <section className={styles.characterBySeiyuuContainer}>
      <h2 className={styles.characterBySeiyuuSectionTitle}>
        Personagens dublados
      </h2>
      <div className={styles.characterBySeiyuuCardsContainer}>
        {characters.map((character) => (
          <CharacterCard
            character={character}
            key={`${character.characterName}-${character.animeTitle}`}
          />
        ))}
      </div>
    </section>
  );
}

function CharacterCard({ character }: { character: SeiyuuCharacterCredit }) {
  const card = (
    <article className={styles.characterBySeiyuuCard}>
      <Image
        className={styles.characterBySeiyuuCover}
        src={assetUrl(character.characterImage) ?? character.characterImage}
        alt={character.characterName}
        width={90}
        height={130}
        unoptimized
      />
      <div className={styles.characterBySeiyuuTextsContainer}>
        <div className={styles.characterBySeiyuuTexts}>
          <h3 className={styles.characterBySeiyuuTitle}>{character.characterName}</h3>
          <dl className={styles.infoGroup}>
            <div className={styles.infoLine}>
              <dt className={styles.infoIcon}><FiTv size={14} aria-hidden="true" /></dt>
              <dd className={styles.characterBySeiyuuInfo}>{character.animeTitle}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );

  return character.characterSlug ? (
    <Link href={`/character/${character.characterSlug}`} className={styles.characterBySeiyuuLink}>
      {card}
    </Link>
  ) : card;
}

export { CharacterBySeiyuu };
