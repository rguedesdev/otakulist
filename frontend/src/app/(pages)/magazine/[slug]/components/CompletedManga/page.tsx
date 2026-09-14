import Image from "next/image";
import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import { RiQuillPenLine, RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import type { MagazineManga } from "../CurrentPublishingManga/page";
import styles from "./completedmanga.module.css";

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
}

function creators(manga: MagazineManga) {
  const names = manga.staffCredits
    .filter(({ role }) => role === "Mangaka" || role === "Gensakusha" || role === "Autor")
    .map(({ person }) => person.displayName);
  return [...new Set(names)].join(", ") || "—";
}

function CompletedManga({ mangas }: { mangas: MagazineManga[] }) {
  if (mangas.length === 0) return null;

  return (
    <section className={styles.completedMangaContainer}>
      <h2 className={styles.completedMangaSectionTitle}>Mangas finalizados</h2>
      <div className={styles.completedMangaCardsContainer}>
        {mangas.map((manga) => (
          <Link href={`/manga/${manga.slug}`} key={manga.id}>
            <article className={styles.completedMangaCard}>
              <Image
                className={styles.completedMangaCover}
                src={assetUrl(manga.coverUrl) ?? manga.coverUrl}
                alt={`Capa de ${manga.title}`}
                width={90}
                height={130}
                unoptimized
              />
              <div className={styles.completedMangaTextsContainer}>
                <div className={styles.completedMangaTexts}>
                  <h3 className={styles.completedMangaTitle}>{manga.title}</h3>
                  <dl className={styles.infoGroup}>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><RiQuillPenLine size={16} aria-hidden="true" /></dt>
                      <dd className={styles.completedMangaInfo}>{creators(manga)}</dd>
                    </div>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><RiRestartLine size={14} aria-hidden="true" /></dt>
                      <dd className={styles.completedMangaInfo}>Início: {formatDate(manga.startDate)}</dd>
                    </div>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><FaRegCheckCircle size={13} aria-hidden="true" /></dt>
                      <dd className={styles.completedMangaInfo}>Término: {formatDate(manga.endDate)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { CompletedManga };
