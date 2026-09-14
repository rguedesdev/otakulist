import Image from "next/image";
import Link from "next/link";
import { LuCalendarRange } from "react-icons/lu";
import { PiTargetFill } from "react-icons/pi";

import { assetUrl } from "@/shared/auth/api";
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
      {magazines.map((magazine) => <Link href={`/magazine/${magazine.slug}`} key={magazine.id}>
        <article className={styles.magazinesByPublisherCard}>
          <Image className={styles.magazinesByPublisherCover} src={assetUrl(magazine.imageUrl) ?? magazine.imageUrl} alt={`Capa de ${magazine.title}`} width={90} height={130} unoptimized />
          <div className={styles.magazinesByPublisherTextsContainer}><div className={styles.magazinesByPublisherTexts}>
            <h3 className={styles.magazinesByPublisherTitle}>{magazine.title}</h3>
            <dl className={styles.infoGroup}>
              <div className={styles.infoLine}><dt className={styles.infoIcon}><PiTargetFill size={16} aria-hidden="true" /></dt><dd className={styles.magazinesByPublisherInfo}>Demografia: {magazine.demography ?? "—"}</dd></div>
              <div className={styles.infoLine}><dt className={styles.infoIcon}><LuCalendarRange size={14} aria-hidden="true" /></dt><dd className={styles.magazinesByPublisherInfo}>Periodicidade: {magazine.frequency ?? "—"}</dd></div>
            </dl>
          </div></div>
        </article>
      </Link>)}
    </div>
  </section>;
}
