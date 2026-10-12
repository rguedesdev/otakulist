import { notFound } from "next/navigation";

import styles from "./publisherslug.module.css";
import { LightNovelsByPublisher, type PublisherLightNovel } from "./components/LightNovelsByPublisher/page";
import { MagazinesByPublisher, type PublisherMagazine } from "./components/MagazinesByPublisher/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { OrganizationEntity } from "@/shared/types/entities";

export const dynamic = "force-dynamic";

type PublisherData = {
  displayName: string;
  imageUrl: string;
  description: string | null;
  foundation: string | null;
  headquarters: string | null;
  externalLinks: Record<string, string | undefined>;
  magazines: PublisherMagazine[];
  lightNovels: PublisherLightNovel[];
};

const query = `query Publisher($slug: String!) {
  publisher(slug: $slug) {
    displayName imageUrl description foundation headquarters
    externalLinks { website x instagram pixiv youtube tiktok }
    magazines { id title slug imageUrl demography frequency }
    lightNovels { id title slug coverUrl status volumes }
  }
}`;

export default async function PublisherBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar a editora");
  const body = await response.json() as { data?: { publisher: PublisherData | null } };
  const publisher = body.data?.publisher;
  if (!publisher) notFound();

  const entity: OrganizationEntity = {
    cover: publisher.imageUrl,
    title: publisher.displayName,
    description: publisher.description ?? "",
    entityType: "organization",
    organizationType: "publisher",
    foundation: publisher.foundation ?? "—",
    headquarters: publisher.headquarters ?? "—",
    externalLinks: publisher.externalLinks,
  };

  return <div className={styles.page}>
    <HeroSection entity={entity} />
    <main className={styles.publisherSlugContainer}>
      <div className={styles.contentContainer}>
        <FormatSidebarInfo entity={entity} />
        <div className={styles.centralContainer}>
          <MagazinesByPublisher magazines={publisher.magazines} />
          <LightNovelsByPublisher novels={publisher.lightNovels} />
        </div>
      </div>
    </main>
  </div>;
}
