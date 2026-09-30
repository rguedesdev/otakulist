import { VscLibrary } from "react-icons/vsc";
import { TbProgressCheck } from "react-icons/tb";

import { assetUrl } from "@/shared/auth/api";
import { catalogStatusLabel } from "@/shared/catalog/labels";
import { MediaCreditCard } from "@/shared/components/MediaCreditCard/page";
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
      {novels.map((novel) => <MediaCreditCard
        href={`/light-novel/${novel.slug}`}
        image={assetUrl(novel.coverUrl) ?? novel.coverUrl}
        imageAlt={`Capa de ${novel.title}`}
        title={novel.title}
        details={[
          { icon: <VscLibrary size={15} aria-hidden="true" />, text: `${novel.volumes} volumes` },
          { icon: <TbProgressCheck size={15} aria-hidden="true" />, text: catalogStatusLabel(novel.status) },
        ]}
        key={novel.id}
      />)}
    </div>
  </section>;
}
