import Image from "next/image";
import Link from "next/link";
import { FiTv } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";

import { assetUrl } from "@/shared/auth/api";
import styles from "./characterbyanime.module.css";

export type CharacterAppearance = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
  formats: string[];
};

const mediumDetails = {
  ANIME: { path: "anime", Icon: FiTv },
  MANGA: { path: "manga", Icon: GiEvilBook },
  LIGHT_NOVEL: { path: "light-novel", Icon: LuBookHeart },
} as const;

const animeFormatLabels: Record<string, string> = {
  TV: "TV",
  MOVIE: "Filme",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "Especial",
};

function appearanceFormat(appearance: CharacterAppearance) {
  if (appearance.medium === "MANGA") return "Manga";
  if (appearance.medium === "LIGHT_NOVEL") return "Light Novel";
  const formats = [...new Set(appearance.formats.map((format) => animeFormatLabels[format] ?? format))];
  return ["Anime", ...formats].join(" • ");
}

function CharacterByMedia({ appearances }: { appearances: CharacterAppearance[] }) {
  if (appearances.length === 0) return null;

  return (
    <section className={styles.characterBySeiyuuContainer}>
      <h2 className={styles.characterBySeiyuuSectionTitle}>Aparece em</h2>
      <div className={styles.characterBySeiyuuCardsContainer}>
        {appearances.map((appearance) => {
          const { path, Icon } = mediumDetails[appearance.medium];
          return (
            <Link href={`/${path}/${appearance.slug}`} key={`${appearance.medium}-${appearance.id}`}>
              <article className={styles.characterBySeiyuuCard}>
                <Image
                  className={styles.characterBySeiyuuCover}
                  src={assetUrl(appearance.coverUrl) ?? appearance.coverUrl}
                  alt={`Capa de ${appearance.title}`}
                  width={75}
                  height={110}
                  unoptimized
                />
                <div className={styles.characterBySeiyuuTextsContainer}>
                  <div className={styles.characterBySeiyuuTexts}>
                    <h3 className={styles.characterBySeiyuuTitle}>{appearance.title}</h3>
                    <dl className={styles.infoGroup}>
                      <div className={styles.infoLine}>
                        <dt className={styles.infoIcon}><Icon size={14} aria-hidden="true" /></dt>
                        <dd className={styles.characterBySeiyuuInfo}>{appearanceFormat(appearance)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export { CharacterByMedia };
