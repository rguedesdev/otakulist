import { FaRegCheckCircle } from "react-icons/fa";
import { RiQuillPenLine, RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { formatSiteDate } from "@/shared/utils/date-format";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
import type { MagazineManga } from "../CurrentPublishingManga/page";
import styles from "./completedmanga.module.css";

function formatDate(value: string | null) {
  return formatSiteDate(value);
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
          <MediaCreditCard
            href={`/manga/${manga.slug}`}
            image={assetUrl(manga.coverUrl) ?? manga.coverUrl}
            imageAlt={`Capa de ${manga.title}`}
            title={manga.title}
            details={[
              { icon: <RiQuillPenLine size={16} aria-hidden="true" />, text: creators(manga) },
              { icon: <RiRestartLine size={14} aria-hidden="true" />, text: `Início: ${formatDate(manga.startDate)}` },
              { icon: <FaRegCheckCircle size={13} aria-hidden="true" />, text: `Término: ${formatDate(manga.endDate)}` },
            ]}
            key={manga.id}
          />
        ))}
      </div>
    </section>
  );
}

export { CompletedManga };
