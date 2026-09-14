import Image from "next/image";
import Link from "next/link";
import { VscLibrary } from "react-icons/vsc";
import { TbProgressCheck } from "react-icons/tb";

import { assetUrl } from "@/shared/auth/api";
import { catalogStatusLabel } from "@/shared/catalog/labels";
import styles from "../MagazinesByPublisher/magazinesbypublisher.module.css";

export type PublisherLightNovel = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  status: string;
  volumes: number;
};

export function LightNovelsByPublisher({ novels }: { novels: PublisherLightNovel[] }) {
  if (novels.length === 0) return null;
  return <section className={styles.magazinesByPublisherContainer}>
    <h2 className={styles.magazinesByPublisherSectionTitle}>Light novels publicadas</h2>
    <div className={styles.magazinesByPublisherCardsContainer}>
      {novels.map((novel) => <Link href={`/light-novel/${novel.slug}`} key={novel.id}>
        <article className={styles.magazinesByPublisherCard}>
          <Image className={styles.magazinesByPublisherCover} src={assetUrl(novel.coverUrl) ?? novel.coverUrl} alt={`Capa de ${novel.title}`} width={90} height={130} unoptimized />
          <div className={styles.magazinesByPublisherTextsContainer}><div className={styles.magazinesByPublisherTexts}>
            <h3 className={styles.magazinesByPublisherTitle}>{novel.title}</h3>
            <dl className={styles.infoGroup}>
              <div className={styles.infoLine}><dt className={styles.infoIcon}><VscLibrary size={15} aria-hidden="true" /></dt><dd className={styles.magazinesByPublisherInfo}>{novel.volumes} volumes</dd></div>
              <div className={styles.infoLine}><dt className={styles.infoIcon}><TbProgressCheck size={15} aria-hidden="true" /></dt><dd className={styles.magazinesByPublisherInfo}>{catalogStatusLabel(novel.status)}</dd></div>
            </dl>
          </div></div>
        </article>
      </Link>)}
    </div>
  </section>;
}
