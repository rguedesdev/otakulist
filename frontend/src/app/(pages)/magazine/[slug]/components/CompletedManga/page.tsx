import { FaRegCheckCircle } from "react-icons/fa";
import { RiQuillPenLine, RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
import type { MagazineManga } from "../CurrentPublishingManga/page";
import styles from "./completedmanga.module.css";

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(parsed);
  const month = ["Jan", "Fev", "Mar", "Abril", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parsed.getUTCMonth()];
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "UTC" }).format(parsed);
  return `${day} ${month} ${year}`;
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
