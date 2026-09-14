// Imports Principais
import Image from "next/image";
import Link from "next/link";

// Style Sheet CSS
import styles from "./related.module.css";
import { assetUrl } from "@/shared/auth/api";
import { catalogMediumLabel, catalogStatusLabel } from "@/shared/catalog/labels";

export type RelatedWork = {
  id: string;
  title: string;
  href: string;
  coverUrl?: string | null;
  medium: string;
  status?: string | null;
};

function RelatedSection({ works = [] }: { works?: RelatedWork[] }) {
  if (works.length === 0) return null;

  return (
    <section className={styles.relatedContainer}>
      <h2 className={styles.relatedSectionTitle}>Relacionados</h2>
      <div className={styles.relatedCardsContainer}>
        {works.map((work) => (
          <Link href={work.href} key={work.id}>
            <article className={styles.relatedCard}>
              {work.coverUrl && <Image className={styles.relatedCover} src={assetUrl(work.coverUrl) ?? work.coverUrl} alt={`Capa de ${work.title}`} width={75} height={110} unoptimized />}
              <div className={styles.relatedTextsContainer}>
                <div className={styles.relatedTexts}>
                  <div className={styles.topTexts}><dl className={styles.infoGroup}><div className={styles.infoLine}><dd className={styles.relatedTitle}>{work.title}</dd></div></dl></div>
                  <dl className={styles.infoGroup}><div className={styles.infoLine}><dd className={styles.info}>{[catalogMediumLabel(work.medium), catalogStatusLabel(work.status)].filter(Boolean).join(" · ")}</dd></div></dl>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

export { RelatedSection };
