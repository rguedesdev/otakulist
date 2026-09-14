import Image from "next/image";
import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import styles from "./animesbystudio.module.css";

export type StudioAnimeCredit = {
  anime: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    startDate: string | null;
    endDate: string | null;
    broadcastSeason: string | null;
  };
};

function displayDate(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function AnimesByStudio({ credits }: { credits: StudioAnimeCredit[] }) {
  return <section className={styles.animesByStudioContainer}>
    <h2 className={styles.animesByStudioSectionTitle}>Animes</h2>
    {credits.length === 0 ? <p className={styles.empty}>Nenhum anime vinculado a este estúdio.</p> : <div className={styles.animesByStudioCardsContainer}>
      {credits.map(({ anime }) => <Link className={styles.animesByStudioCard} href={`/anime/${anime.slug}`} key={anime.id}>
        <Image className={styles.animesByStudioCover} src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt={`Capa de ${anime.title}`} width={90} height={130} unoptimized />
        <div className={styles.animesByStudioTextsContainer}><div className={styles.animesByStudioTexts}>
          <h3 className={styles.animesByStudioTitle}>{anime.title}</h3>
          <dl className={styles.infoGroup}>
            <div className={styles.infoLine}><dt className={styles.infoIcon}><LiaCanadianMapleLeaf size={18} aria-hidden="true" /></dt><dd className={styles.animesByStudioInfo}>Temporada: {anime.broadcastSeason ?? "Não informada"}</dd></div>
            <div className={styles.infoLine}><dt className={styles.infoIcon}><RiRestartLine size={14} aria-hidden="true" /></dt><dd className={styles.animesByStudioInfo}>Início: {displayDate(anime.startDate)}</dd></div>
            <div className={styles.infoLine}><dt className={styles.infoIcon}><FaRegCheckCircle size={13} aria-hidden="true" /></dt><dd className={styles.animesByStudioInfo}>Término: {displayDate(anime.endDate)}</dd></div>
          </dl>
        </div></div>
      </Link>)}
    </div>}
  </section>;
}

export { AnimesByStudio };
