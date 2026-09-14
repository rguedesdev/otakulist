import Image from "next/image";
import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import { PiFilmSlate } from "react-icons/pi";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import styles from "./animesbystaff.module.css";

export type StaffAnimeCredit = { role: string; contribution: string | null; anime: { title: string; slug: string; coverUrl: string; startDate: string | null; endDate: string | null } };
const date = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";

function AnimesByStaff({ credits }: { credits: StaffAnimeCredit[] }) {
  if (credits.length === 0) return null;
  return <section className={styles.animesByStaffContainer}>
    <h2 className={styles.animesByStaffSectionTitle}>Animes</h2>
    <div className={styles.animesByStaffCardsContainer}>{credits.map(({ anime, role, contribution }) => <Link href={`/anime/${anime.slug}`} key={`${anime.slug}-${role}`}>
      <article className={styles.animesByStaffCard}>
        <Image className={styles.animesByStaffCover} src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt={anime.title} width={90} height={130} unoptimized />
        <div className={styles.animesByStaffTextsContainer}><div className={styles.animesByStaffTexts}><h3 className={styles.animesByStaffTitle}>{anime.title}</h3><dl className={styles.infoGroup}>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><PiFilmSlate size={16} /></dt><dd className={styles.animesByStaffInfo}>{role}{contribution ? ` • ${contribution}` : ""}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><RiRestartLine size={14} /></dt><dd className={styles.animesByStaffInfo}>Início: {date(anime.startDate)}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><FaRegCheckCircle size={13} /></dt><dd className={styles.animesByStaffInfo}>Término: {date(anime.endDate)}</dd></div>
        </dl></div></div>
      </article>
    </Link>)}</div>
  </section>;
}

export { AnimesByStaff };
export default AnimesByStaff;
