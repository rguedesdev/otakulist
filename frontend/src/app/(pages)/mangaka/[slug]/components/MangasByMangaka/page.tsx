import Image from "next/image";
import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { normalizeStaffCredit } from "@/shared/catalog/staff-roles";
import { StaffRoleIcon } from "@/shared/components/StaffSection/page";
import styles from "./mangasbymangaka.module.css";

export type MangakaMangaCredit = { role: string; contribution: string | null; manga: { title: string; slug: string; coverUrl: string; startDate: string | null; endDate: string | null } };
const date = (value: string | null) => {
  if (!value) return "—";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
};

function MangasByMangaka({ credits }: { credits: MangakaMangaCredit[] }) {
  if (credits.length === 0) return null;
  return <section className={styles.mangasByMangakaContainer}>
    <h2 className={styles.mangasByMangakaSectionTitle}>Mangas</h2>
    <div className={styles.mangasByMangakaCardsContainer}>{credits.map(({ manga, role, contribution }) => {
      const normalizedCredit = normalizeStaffCredit({ role, contribution });
      return <Link href={`/manga/${manga.slug}`} key={`${manga.slug}-${role}`}>
      <article className={styles.mangasByMangakaCard}>
        <Image className={styles.mangasByMangakaCover} src={assetUrl(manga.coverUrl) ?? manga.coverUrl} alt={manga.title} width={90} height={130} unoptimized />
        <div className={styles.mangasByMangakaTextsContainer}><div className={styles.mangasByMangakaTexts}><h3 className={styles.mangasByMangakaTitle}>{manga.title}</h3><dl className={styles.infoGroup}>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><StaffRoleIcon role={normalizedCredit.role} size={16} /></dt><dd className={styles.mangasByMangakaInfo}>{normalizedCredit.role}{normalizedCredit.contribution ? ` • ${normalizedCredit.contribution}` : ""}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><RiRestartLine size={14} /></dt><dd className={styles.mangasByMangakaInfo}>Início: {date(manga.startDate)}</dd></div>
          <div className={styles.infoLine}><dt className={styles.infoIcon}><FaRegCheckCircle size={13} /></dt><dd className={styles.mangasByMangakaInfo}>Término: {date(manga.endDate)}</dd></div>
        </dl></div></div>
      </article>
    </Link>;
    })}</div>
  </section>;
}

export { MangasByMangaka };
export default MangasByMangaka;
