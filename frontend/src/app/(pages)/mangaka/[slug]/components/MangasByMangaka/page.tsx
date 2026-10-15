"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { formatSiteDate } from "@/shared/utils/date-format";
import { normalizeStaffCredit } from "@/shared/catalog/staff-roles";
import { StaffRoleIcon } from "@/shared/components/StaffSection/page";
import styles from "./mangasbymangaka.module.css";

export type MangakaMangaCredit = { role: string; contribution: string | null; manga: { title: string; slug: string; coverUrl: string; startDate: string | null; endDate: string | null } };
const date = (value: string | null) => {
  return formatSiteDate(value);
};

function MangasByMangaka({ credits }: { credits: MangakaMangaCredit[] }) {
  const router = useRouter();
  if (credits.length === 0) return null;
  return <section className={styles.mangasByMangakaContainer}>
    <h2 className={styles.mangasByMangakaSectionTitle}>Mangas</h2>
    <div className={styles.mangasByMangakaCardsContainer}>{credits.map(({ manga, role, contribution }) => {
      const normalizedCredit = normalizeStaffCredit({ role, contribution });
      return <button className={styles.mangasByMangakaCard} type="button" onClick={() => router.push(`/manga/${manga.slug}`)} key={`${manga.slug}-${role}`}>
        <Image className={styles.mangasByMangakaCover} src={assetUrl(manga.coverUrl) ?? manga.coverUrl} alt={manga.title} width={90} height={130} unoptimized />
        <span className={styles.mangasByMangakaTextsContainer}>
          <span className={styles.mangasByMangakaTexts}>
            <strong className={styles.mangasByMangakaTitle}>{manga.title}</strong>
            <span className={styles.infoGroup}>
              <span className={styles.infoLine}><span className={styles.infoIcon}><StaffRoleIcon role={normalizedCredit.role} size={16} /></span><span className={styles.mangasByMangakaInfo}>{normalizedCredit.role}{normalizedCredit.contribution ? ` • ${normalizedCredit.contribution}` : ""}</span></span>
              <span className={styles.infoLine}><span className={styles.infoIcon}><RiRestartLine size={14} aria-hidden="true" /></span><span className={styles.mangasByMangakaInfo}>Início: {date(manga.startDate)}</span></span>
              <span className={styles.infoLine}><span className={styles.infoIcon}><FaRegCheckCircle size={13} aria-hidden="true" /></span><span className={styles.mangasByMangakaInfo}>Término: {date(manga.endDate)}</span></span>
            </span>
          </span>
        </span>
      </button>;
    })}</div>
  </section>;
}

export { MangasByMangaka };
export default MangasByMangaka;
