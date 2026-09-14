import { notFound } from "next/navigation";

import styles from "./magazineslug.module.css";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { PublicationEntity } from "@/shared/types/entities";
import { CompletedManga } from "./components/CompletedManga/page";
import { CurrentPublishingManga, type MagazineManga } from "./components/CurrentPublishingManga/page";

export const dynamic = "force-dynamic";

type MagazineData = {
  title: string;
  description: string;
  imageUrl: string;
  foundation: string | null;
  demography: string | null;
  frequency: string | null;
  publisher: { displayName: string; slug: string };
  mangas: MagazineManga[];
};

const query = `query Magazine($slug: String!) {
  magazine(slug: $slug) {
    title description imageUrl foundation demography frequency
    publisher { displayName slug }
    mangas {
      id title slug coverUrl status startDate endDate
      staffCredits { role contribution person { displayName } }
    }
  }
}`;

export default async function MagazineBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { slug } }), cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar a magazine");
  const body = await response.json() as { data?: { magazine: MagazineData | null } };
  const magazine = body.data?.magazine;
  if (!magazine) notFound();
  const entity: PublicationEntity = {
    cover: magazine.imageUrl, title: magazine.title, description: magazine.description,
    entityType: "publication", publicationType: "magazine",
    foundation: magazine.foundation ?? "—", publisher: magazine.publisher.displayName,
    publisherLink: magazine.publisher, demography: magazine.demography ?? "—", frequency: magazine.frequency ?? "—",
  };
  const publishingMangas = magazine.mangas.filter((manga) => manga.status === "PUBLISHING");
  const completedMangas = magazine.mangas.filter((manga) => manga.status === "FINISHED");

  return (
    <div className={styles.page}>
      <HeroSection entity={entity} />
      <main className={styles.magazineSlugContainer}>
        <div className={styles.contentContainer}>
          <FormatSidebarInfo entity={entity} />
          <div className={styles.centralContainer}>
            <CurrentPublishingManga mangas={publishingMangas} />
            <CompletedManga mangas={completedMangas} />
          </div>
        </div>
      </main>
    </div>
  );
}
