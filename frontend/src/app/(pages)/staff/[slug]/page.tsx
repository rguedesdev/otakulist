import { notFound } from "next/navigation";

import { assetUrl } from "@/shared/auth/api";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import type { PersonEntity, PersonRole } from "@/shared/types/entities";
import { AnimesByStaff, type StaffAnimeCredit } from "./components/AnimesByStaff/page";
import styles from "./staffslug.module.css";

export const dynamic = "force-dynamic";
const query = `query Staff($slug: String!) { staff(slug: $slug) {
  displayName nameKanji imageUrl description roles dateOfBirth hometown activityPeriod occupations
  externalLinks { website x instagram pixiv youtube tiktok }
  animeCredits { role contribution anime { title slug coverUrl startDate endDate } }
} }`;
type StoredPerson = { displayName: string; nameKanji: string | null; imageUrl: string | null; description: string | null; roles: string[]; dateOfBirth: string | null; hometown: string | null; activityPeriod: string | null; occupations: string[]; externalLinks: Record<string, string | undefined>; animeCredits: StaffAnimeCredit[] };

async function StaffBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let staff: StoredPerson | null = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { slug } }), cache: "no-store" });
    const body = await response.json() as { data?: { staff: StoredPerson | null } };
    staff = body.data?.staff ?? null;
  } catch { /* página inexistente quando a API estiver indisponível */ }
  if (!staff?.imageUrl) notFound();

  const entity: PersonEntity = { cover: assetUrl(staff.imageUrl) ?? staff.imageUrl, description: staff.description ?? "", entityType: "person", roles: staff.roles.map((role) => role.toLowerCase() as PersonRole), name_romaji: staff.displayName, name_kanji: staff.nameKanji ?? "", hometown: staff.hometown ?? "", date_of_birth: staff.dateOfBirth ?? "", activity_period: staff.activityPeriod ?? undefined, occupations: staff.occupations, externalLinks: staff.externalLinks };
  return <div className={styles.page}><HeroSection entity={entity} /><main className={styles.staffSlugContainer}><div className={styles.contentContainer}><FormatSidebarInfo entity={entity} /><div className={styles.centralContainer}><AnimesByStaff credits={staff.animeCredits} /></div></div></main></div>;
}

export default StaffBySlug;
