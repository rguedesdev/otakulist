import { notFound } from "next/navigation";

import { assetUrl } from "@/shared/auth/api";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { PersonEntity, PersonRole } from "@/shared/types/entities";
import { AnimesByMangaka } from "./components/AnimesByMangaka/page";
import { MangasByMangaka, type MangakaMangaCredit } from "./components/MangasByMangaka/page";
import type { StaffAnimeCredit } from "@/app/(pages)/staff/[slug]/components/AnimesByStaff/page";
import styles from "./mangakaslug.module.css";

export const dynamic = "force-dynamic";
const query = `query Mangaka($slug: String!) { mangaka(slug: $slug) {
  displayName nameKanji imageUrl description roles dateOfBirth hometown activityPeriod occupations
  externalLinks { website x instagram pixiv youtube tiktok }
  animeCredits { role contribution anime { title slug coverUrl startDate endDate } }
  mangaCredits { role contribution manga { title slug coverUrl startDate endDate } }
} }`;
type StoredPerson = { displayName: string; nameKanji: string | null; imageUrl: string | null; description: string | null; roles: string[]; dateOfBirth: string | null; hometown: string | null; activityPeriod: string | null; occupations: string[]; externalLinks: Record<string, string | undefined>; animeCredits: StaffAnimeCredit[]; mangaCredits: MangakaMangaCredit[] };

async function MangakaBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let mangaka: StoredPerson | null = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { slug } }), cache: "no-store" });
    const body = await response.json() as { data?: { mangaka: StoredPerson | null } };
    mangaka = body.data?.mangaka ?? null;
  } catch { /* página inexistente quando a API estiver indisponível */ }
  if (!mangaka?.imageUrl) notFound();

  const entity: PersonEntity = { cover: assetUrl(mangaka.imageUrl) ?? mangaka.imageUrl, description: mangaka.description ?? "", entityType: "person", roles: mangaka.roles.map((role) => role.toLowerCase() as PersonRole), name_romaji: mangaka.displayName, name_kanji: mangaka.nameKanji ?? "", hometown: mangaka.hometown ?? "", date_of_birth: mangaka.dateOfBirth ?? "", activity_period: mangaka.activityPeriod ?? undefined, occupations: mangaka.occupations, externalLinks: mangaka.externalLinks };
  return <div className={styles.page}><HeroSection entity={entity} /><main className={styles.mangakaSlugContainer}><div className={styles.contentContainer}><FormatSidebarInfo entity={entity} /><div className={styles.centralContainer}><MangasByMangaka credits={mangaka.mangaCredits} /><AnimesByMangaka credits={mangaka.animeCredits} /></div></div></main></div>;
}

export default MangakaBySlug;
