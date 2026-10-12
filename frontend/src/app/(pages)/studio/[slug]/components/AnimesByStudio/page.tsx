import { FaRegCheckCircle } from "react-icons/fa";
import { LiaCanadianMapleLeaf } from "react-icons/lia";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
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

function displayDate(value: string | null, fallback = "Não informado") {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return fallback;
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(date);
  const month = ["Jan", "Fev", "Mar", "Abril", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][date.getUTCMonth()];
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "UTC" }).format(date);
  return `${day} ${month} ${year}`;
}

function AnimesByStudio({ credits }: { credits: StudioAnimeCredit[] }) {
  return <section className={styles.animesByStudioContainer}>
    <h2 className={styles.animesByStudioSectionTitle}>Animes</h2>
    {credits.length === 0 ? <p className={styles.empty}>Nenhum anime vinculado a este estúdio.</p> : <div className={styles.animesByStudioCardsContainer}>
      {credits.map(({ anime }) => <MediaCreditCard
        href={`/anime/${anime.slug}`}
        image={assetUrl(anime.coverUrl) ?? anime.coverUrl}
        imageAlt={`Capa de ${anime.title}`}
        title={anime.title}
        details={[
          { icon: <LiaCanadianMapleLeaf size={18} aria-hidden="true" />, text: `Temporada: ${anime.broadcastSeason ?? "Não informada"}` },
          { icon: <RiRestartLine size={14} aria-hidden="true" />, text: `Início: ${displayDate(anime.startDate)}` },
          { icon: <FaRegCheckCircle size={13} aria-hidden="true" />, text: `Término: ${displayDate(anime.endDate, "—")}` },
        ]}
        key={anime.id}
      />)}
    </div>}
  </section>;
}

export { AnimesByStudio };
