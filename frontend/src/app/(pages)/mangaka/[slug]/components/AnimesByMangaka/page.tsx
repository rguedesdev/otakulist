"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiRestartLine } from "react-icons/ri";

import type { StaffAnimeCredit } from "@/app/(pages)/staff/[slug]/components/AnimesByStaff/page";
import { assetUrl } from "@/shared/auth/api";
import { normalizeStaffCredit } from "@/shared/catalog/staff-roles";
import { StaffRoleIcon } from "@/shared/components/StaffSection/page";
import styles from "./animesbymangaka.module.css";

const date = (value: string | null) => {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "—";
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(parsed);
  const month = ["Jan", "Fev", "Mar", "Abril", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parsed.getUTCMonth()];
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "UTC" }).format(parsed);
  return `${day} ${month} ${year}`;
};

function AnimesByMangaka({ credits }: { credits: StaffAnimeCredit[] }) {
  const router = useRouter();
  if (credits.length === 0) return null;
  return <section className={styles.animesByMangakaContainer}>
    <h2 className={styles.animesByMangakaSectionTitle}>Animes</h2>
    <div className={styles.animesByMangakaCardsContainer}>{credits.map(({ anime, role, contribution }) => {
      const normalizedCredit = normalizeStaffCredit({ role, contribution });
      return <button className={styles.animesByMangakaCard} type="button" onClick={() => router.push(`/anime/${anime.slug}`)} key={`${anime.slug}-${role}`}>
        <Image className={styles.animesByMangakaCover} src={assetUrl(anime.coverUrl) ?? anime.coverUrl} alt={anime.title} width={90} height={130} unoptimized />
        <span className={styles.animesByMangakaTextsContainer}>
          <span className={styles.animesByMangakaTexts}>
            <strong className={styles.animesByMangakaTitle}>{anime.title}</strong>
            <span className={styles.infoGroup}>
              <span className={styles.infoLine}><span className={styles.infoIcon}><StaffRoleIcon role={normalizedCredit.role} size={16} /></span><span className={styles.animesByMangakaInfo}>{normalizedCredit.role}{normalizedCredit.contribution ? ` • ${normalizedCredit.contribution}` : ""}</span></span>
              <span className={styles.infoLine}><span className={styles.infoIcon}><RiRestartLine size={14} aria-hidden="true" /></span><span className={styles.animesByMangakaInfo}>Início: {date(anime.startDate)}</span></span>
              <span className={styles.infoLine}><span className={styles.infoIcon}><FaRegCheckCircle size={13} aria-hidden="true" /></span><span className={styles.animesByMangakaInfo}>Término: {date(anime.endDate)}</span></span>
            </span>
          </span>
        </span>
      </button>;
    })}</div>
  </section>;
}

export { AnimesByMangaka };
export default AnimesByMangaka;
