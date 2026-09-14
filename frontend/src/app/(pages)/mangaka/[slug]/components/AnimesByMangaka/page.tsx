import Image from "next/image";
import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiRestartLine } from "react-icons/ri";

import type { StaffAnimeCredit } from "@/app/(pages)/staff/[slug]/components/AnimesByStaff/page";
import { assetUrl } from "@/shared/auth/api";
import { normalizeStaffCredit } from "@/shared/catalog/staff-roles";
import { StaffRoleIcon } from "@/shared/components/StaffSection/page";
import styles from "./animesbymangaka.module.css";

const date = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";

function AnimesByMangaka({ credits }: { credits: StaffAnimeCredit[] }) {
  if (credits.length === 0) return null;
  return <section className={styles.animesByMangakaContainer}>
    <h2 className={styles.animesByMangakaSectionTitle}>Animes</h2>
    <div className={styles.animesByMangakaCardsContainer}>{credits.map(({ anime, role, contribution }) => {
      const normalizedCredit = normalizeStaffCredit({ role, contribution });
      return <Link href={`/anime/${anime.slug}`} key={`${anime.slug}-${role}`}>
      <article className={styles.animesByMangakaCard}>
        <Image className={styles.animesByMangakaCover} src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt={anime.title} width={90} height={130} unoptimized />
        <div className={styles.animesByMangakaTextsContainer}><div className={styles.animesByMangakaTexts}><h3 className={styles.animesByMangakaTitle}>{anime.title}</h3><dl className={styles.infoGroup}>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><StaffRoleIcon role={normalizedCredit.role} size={16} /></dt><dd className={styles.animesByMangakaInfo}>{normalizedCredit.role}{normalizedCredit.contribution ? ` • ${normalizedCredit.contribution}` : ""}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><RiRestartLine size={14} /></dt><dd className={styles.animesByMangakaInfo}>Início: {date(anime.startDate)}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><FaRegCheckCircle size={13} /></dt><dd className={styles.animesByMangakaInfo}>Término: {date(anime.endDate)}</dd></div>
        </dl></div></div>
      </article>
    </Link>;
    })}</div>
  </section>;
}

export { AnimesByMangaka };
export default AnimesByMangaka;
