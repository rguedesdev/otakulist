import { LuCalendarRange } from "react-icons/lu";
import { PiTargetFill } from "react-icons/pi";

import { assetUrl } from "@/shared/auth/api";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
import styles from "./magazinesbypublisher.module.css";

export type PublisherMagazine = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  demography: string | null;
  frequency: string | null;
};

export function MagazinesByPublisher({ magazines }: { magazines: PublisherMagazine[] }) {
  if (magazines.length === 0) return null;
  return <section className={styles.magazinesByPublisherContainer}>
    <h2 className={styles.magazinesByPublisherSectionTitle}>Magazines publicadas</h2>
    <div className={styles.magazinesByPublisherCardsContainer}>
      {magazines.map((magazine) => <MediaCreditCard
        href={`/magazine/${magazine.slug}`}
        image={assetUrl(magazine.imageUrl) ?? magazine.imageUrl}
        imageAlt={`Capa de ${magazine.title}`}
        title={magazine.title}
        details={[
          { icon: <PiTargetFill size={16} aria-hidden="true" />, text: `Demografia: ${magazine.demography ?? "—"}` },
          { icon: <LuCalendarRange size={14} aria-hidden="true" />, text: `Periodicidade: ${magazine.frequency ?? "—"}` },
        ]}
        key={magazine.id}
      />)}
    </div>
  </section>;
}
