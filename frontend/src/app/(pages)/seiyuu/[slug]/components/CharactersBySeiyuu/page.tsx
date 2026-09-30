// Imports Principais
import type { SeiyuuCharacterCredit } from "../../data";

// Style Sheet CSS
import styles from "./charactersbyseiyuu.module.css";

// Icones
import { FiTv } from "react-icons/fi";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";

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
          <MediaCreditCard
            href={character.characterSlug ? `/character/${character.characterSlug}` : undefined}
            image={character.characterImage}
            imageAlt={character.characterName}
            title={character.characterName}
            details={[{ icon: <FiTv size={14} aria-hidden="true" />, text: character.animeTitle }]}
            key={`${character.characterName}-${character.animeTitle}`}
          />
        ))}
      </div>
    </section>
  );
}

export { CharacterBySeiyuu };
