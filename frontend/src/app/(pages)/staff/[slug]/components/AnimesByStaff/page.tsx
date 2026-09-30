import { FaRegCheckCircle } from "react-icons/fa";
import { PiFilmSlate } from "react-icons/pi";
import { RiRestartLine } from "react-icons/ri";

import { assetUrl } from "@/shared/auth/api";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
import styles from "./animesbystaff.module.css";

export type StaffAnimeCredit = { role: string; contribution: string | null; anime: { title: string; slug: string; coverUrl: string; startDate: string | null; endDate: string | null } };
const date = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "—";

function AnimesByStaff({ credits }: { credits: StaffAnimeCredit[] }) {
  if (credits.length === 0) return null;
  return <section className={styles.animesByStaffContainer}>
    <h2 className={styles.animesByStaffSectionTitle}>Animes</h2>
    <div className={styles.animesByStaffCardsContainer}>{credits.map(({ anime, role, contribution }) => <MediaCreditCard
      href={`/anime/${anime.slug}`}
      image={assetUrl(anime.coverUrl) ?? anime.coverUrl}
      imageAlt={anime.title}
      title={anime.title}
      details={[
        { icon: <PiFilmSlate size={16} aria-hidden="true" />, text: `${role}${contribution ? ` • ${contribution}` : ""}` },
        { icon: <RiRestartLine size={14} aria-hidden="true" />, text: `Início: ${date(anime.startDate)}` },
        { icon: <FaRegCheckCircle size={13} aria-hidden="true" />, text: `Término: ${date(anime.endDate)}` },
      ]}
      key={`${anime.slug}-${role}`}
    />)}</div>
  </section>;
}

export { AnimesByStaff };
export default AnimesByStaff;
