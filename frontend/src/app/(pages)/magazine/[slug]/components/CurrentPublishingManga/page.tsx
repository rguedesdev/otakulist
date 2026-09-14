import Image from "next/image";
import Link from "next/link";
import { RiQuillPenLine, RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import styles from "./currentpublishingmanga.module.css";

export type MagazineManga = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  staffCredits: Array<{
    role: string;
    contribution: string | null;
    person: { displayName: string };
  }>;
};

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

function CurrentPublishingManga({ mangas }: { mangas: MagazineManga[] }) {
  if (mangas.length === 0) return null;

  return (
    <section className={styles.currentPublishingMangaContainer}>
      <h2 className={styles.currentPublishingMangaSectionTitle}>Mangas em serialização</h2>
      <div className={styles.currentPublishingMangaCardsContainer}>
        {mangas.map((manga) => (
          <Link href={`/manga/${manga.slug}`} key={manga.id}>
            <article className={styles.currentPublishingMangaCard}>
              <Image
                className={styles.currentPublishingMangaCover}
                src={assetUrl(manga.coverUrl) ?? manga.coverUrl}
                alt={`Capa de ${manga.title}`}
                width={90}
                height={130}
                unoptimized
              />
              <div className={styles.currentPublishingMangaTextsContainer}>
                <div className={styles.currentPublishingMangaTexts}>
                  <h3 className={styles.currentPublishingMangaTitle}>{manga.title}</h3>
                  <dl className={styles.infoGroup}>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><RiQuillPenLine size={16} aria-hidden="true" /></dt>
                      <dd className={styles.currentPublishingMangaInfo}>{creators(manga)}</dd>
                    </div>
                    <div className={styles.infoLine}>
                      <dt className={styles.infoIcon}><RiRestartLine size={14} aria-hidden="true" /></dt>
                      <dd className={styles.currentPublishingMangaInfo}>Início: {formatDate(manga.startDate)}</dd>
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

export { CurrentPublishingManga };
