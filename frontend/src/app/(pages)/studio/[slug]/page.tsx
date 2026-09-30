import { notFound } from "next/navigation";

import { assetUrl } from "@/shared/auth/api";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { OrganizationEntity } from "@/shared/types/entities";
import { AnimesByStudio, type StudioAnimeCredit } from "./components/AnimesByStudio/page";
import styles from "./studioslug.module.css";

export const dynamic = "force-dynamic";

type StudioData = {
  displayName: string;
  nameKanji: string | null;
  imageUrl: string;
  description: string | null;
  foundation: string | null;
  headquarters: string | null;
  externalLinks: Record<string, string | undefined>;
  animeCredits: StudioAnimeCredit[];
};

const query = `query Studio($slug: String!) { studio(slug: $slug) {
  displayName nameKanji imageUrl description foundation headquarters
  externalLinks { website x instagram pixiv youtube }
  animeCredits { anime { id title slug coverUrl startDate endDate broadcastSeason } }
} }`;

async function getStudio(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o estúdio");
  const body = await response.json() as { data?: { studio: StudioData | null } };
  return body.data?.studio ?? null;
}

export default async function StudioBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const studio = await getStudio(slug);
  if (!studio) notFound();

  const entity: OrganizationEntity = {
    cover: assetUrl(studio.imageUrl) ?? studio.imageUrl,
    title: studio.displayName,
    description: studio.description ?? "",
    entityType: "organization",
    organizationType: "studio",
    foundation: studio.foundation ?? "Não informado",
    name_kanji: studio.nameKanji ?? undefined,
    headquarters: studio.headquarters ?? undefined,
    externalLinks: studio.externalLinks,
  };

  return <div className={styles.page}>
    <HeroSection entity={entity} />
    <main className={styles.studioSlugContainer}>
      <div className={styles.contentContainer}>
        <FormatSidebarInfo entity={entity} />
        <div className={styles.centralContainer}><AnimesByStudio credits={studio.animeCredits} /></div>
      </div>
    </main>
  </div>;
}
