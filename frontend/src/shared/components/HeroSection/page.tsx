// Imports Principais
import Image from "next/image";

// Style Sheet CSS
import styles from "./herosection.module.css";

// Icons
import { TbPlaylistAdd, TbPlaylistX } from "react-icons/tb";
import { MdOutlineFavoriteBorder } from "react-icons/md";

function HeroSection({ FormatInfo }) {
  return (
    <div className={styles.heroSectionContainer}>
      <section className={styles.heroSection}>
        {/* Container da Esquerda: Capa e Botões */}
        <div className={styles.coverContainer}>
          <div className={styles.imageWrapper}>
            <Image
              className={styles.cover}
              src={FormatInfo.cover}
              alt="Mayonaka Heart Tune Cover"
              width={200} /* Largura base */
              height={300} /* Altura base (proporção máxima de 2/3) */
              priority
            />
          </div>

          {FormatInfo.format != "magazine" &&
          FormatInfo.format != "publisher" ? (
            <>
              <div className={styles.buttons}>
                <button className={styles.btnAddList}>
                  <TbPlaylistAdd size={22} aria-hidden="true" />
                  <span>Adicionar</span>
                </button>

                {/* <button className={styles.btnAddList}>
              <TbPlaylistX size={22} aria-hidden="true" />
              <span>Remover</span>
            </button> */}

                <button className={styles.btnAddFavorite}>
                  <MdOutlineFavoriteBorder size={20} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>

        {/* Container da Direita: Textos e Sinônimos */}
        <div className={styles.textsContainer}>
          <div className={styles.texts}>
            <h1 className={styles.title}>{FormatInfo.title}</h1>
            <p className={styles.description}>{FormatInfo.description}</p>
          </div>

          <hr className={styles.hrFaded} />

          <div className={styles.synonymsContainer}>
            <h2 className={styles.synonymsTitle}>Títulos Alternativos</h2>
            <div className={styles.synonymsList}>
              <span className={styles.synonym}>Japonês: 会長はメイド様!</span>
              <span className={styles.separator}>|</span>
              <span className={styles.synonym}>
                Romaji: Kaichou wa Meido-sama!
              </span>
              <span className={styles.separator}>|</span>
              <span className={styles.synonym}>Inglês: Maid-sama!</span>
              <span className={styles.separator}>|</span>
              <span className={styles.synonym}>
                Literal: Class President is a Maid!
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { HeroSection };
