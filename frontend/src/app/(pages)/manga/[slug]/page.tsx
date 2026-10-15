import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { BiHash } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { GiEvilBook } from "react-icons/gi";
import { LuCalendarRange } from "react-icons/lu";
import { VscLibrary } from "react-icons/vsc";

import styles from "./mangaslug.module.css";
import { formatSiteDate } from "@/shared/utils/date-format";
import { MangaTrackerPanel } from "./components/MangaTrackerPanel/MangaTrackerPanel";
import { PublicationCharacterSection, type PublicationCharacter } from "@/shared/components/PublicationCharacterSection/page";
import { AdultContentGate } from "@/shared/components/AdultContentGate/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { ReviewCommentsSection, type PublicWorkReview } from "@/shared/components/ReviewCommentsSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { WorkSectionTabs } from "@/shared/components/WorkSectionTabs/page";
import type { MangaEntity } from "@/shared/types/entities";

export const dynamic = "force-dynamic";

type MangaData = {
  title: string; synopsis: string; coverUrl: string; alternativeTitles: MangaEntity["alternativeTitles"];
  status: string; adultContent: boolean; startDate: string | null; endDate: string | null; magazine: string | null; magazineEntity: { title: string; slug: string } | null;
  publisher: string | null; publisherEntity: { displayName: string; slug: string } | null; demography: string | null; genres: string[]; chapters: number;
  volumes: number; externalLinks: NonNullable<MangaEntity["externalLinks"]>;
  storeLinks: NonNullable<MangaEntity["storeLinks"]>;
  reviewSummary: { average: number; count: number };
  characters: PublicationCharacter[];
  staffCredits: Array<{ role: string; contribution: string | null; person: { id: string; displayName: string; slug: string; imageUrl: string | null; roles: string[] } }>;
  relatedWorks: Array<{ id: string; relationType: string | null; title: string; href: string; coverUrl: string | null; medium: string; status: string | null }>;
};
type MangaQueryData = { manga: MangaData | null; workReviewComments: PublicWorkReview[] };

const query = `query Manga($slug: String!, $includeAdult: Boolean!) {
  manga(slug: $slug, includeAdult: $includeAdult) {
    title synopsis coverUrl alternativeTitles { type title } status adultContent startDate endDate magazine magazineEntity { title slug } publisher publisherEntity { displayName slug }
    demography genres chapters volumes externalLinks { website x instagram pixiv youtube tiktok }
    storeLinks { amazon cdJapan mercadoLivre rakuten shopee ebay otakuyasan hmv honto toranoana animate }
    reviewSummary { average count }
    characters { id nameRomaji slug imageUrl }
    staffCredits { role contribution person { id displayName slug imageUrl roles } }
    relatedWorks { id relationType title href coverUrl medium status }
  }
  workReviewComments(medium: MANGA, slug: $slug) {
    id score comment updatedAt
    author { username displayName avatarUrl }
  }
}`;

const statuses: Record<string, string> = {
  ANNOUNCED: "Anunciado", PUBLISHING: "Em andamento", HIATUS: "Em hiato", FINISHED: "Finalizado", CANCELLED: "Cancelado",
};

function displayDate(value: string | null) {
  return formatSiteDate(value);
}

async function getManga(slug: string, includeAdult: boolean) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug, includeAdult } }), cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o manga");
  const body = await response.json() as { data?: MangaQueryData };
  return body.data ?? null;
}

export default async function MangaBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const data = await getManga(slug, includeAdult);
  if (!data?.manga) notFound();
  const { manga, workReviewComments } = data;
  const publicationEnd = manga.endDate ? displayDate(manga.endDate) : "Presente";

  const entity: MangaEntity = {
    cover: manga.coverUrl, title: manga.title, description: manga.synopsis, alternativeTitles: manga.alternativeTitles,
    entityType: "work", medium: "manga", score: manga.reviewSummary.average, status: statuses[manga.status] ?? manga.status,
    start: displayDate(manga.startDate),
    end: displayDate(manga.endDate),
    magazine: manga.magazineEntity?.title ?? manga.magazine ?? "Não informada",
    magazineLink: manga.magazineEntity ?? undefined,
    publisher: manga.publisherEntity?.displayName ?? manga.publisher ?? undefined,
    publisherLink: manga.publisherEntity ?? undefined,
    demography: manga.demography ?? "Não informada", genders: manga.genres,
    chapters: manga.chapters, volumes: manga.volumes,
    publicationPeriod: `${displayDate(manga.startDate)} ~ ${publicationEnd}`,
    externalLinks: manga.externalLinks, storeLinks: manga.storeLinks,
  };

  return <AdultContentGate blocked={manga.adultContent && !includeAdult}><div className={styles.page}>
    <HeroSection entity={entity} publicationTracker={{ medium: "MANGA", workKey: slug }} />
    <div className={styles.factsBar} aria-label="Resumo do manga">
      <div className={styles.factItem}><GiEvilBook aria-hidden="true" /><span><small>Formato</small>Manga</span></div>
      <div className={styles.factItem}><BiHash aria-hidden="true" /><span><small>Capítulos</small>{entity.chapters > 0 ? `${entity.chapters} capítulos` : "Total em aberto"}</span></div>
      <div className={styles.factItem}><VscLibrary aria-hidden="true" /><span><small>Volumes</small>{entity.volumes} publicados</span></div>
      <div className={styles.factItem}><LuCalendarRange aria-hidden="true" /><span><small>Publicação</small>{entity.publicationPeriod}</span></div>
      <div className={styles.factItem}><FaStar aria-hidden="true" /><span><small>Score</small>{entity.score.toFixed(1)}</span></div>
    </div>
    <main className={styles.mangaSlugContainer}>
      <WorkSectionTabs
        classes={styles}
        sidebar={<FormatSidebarInfo entity={entity} reviewTarget={{ medium: "MANGA", slug, title: manga.title }} />}
        tracker={<MangaTrackerPanel totalChapters={entity.chapters} workKey={slug} />}
        sections={[
          ...(manga.characters.length ? [{ id: "personagens", label: "Personagens", content: <PublicationCharacterSection characters={manga.characters} />, generalContent: <PublicationCharacterSection characters={manga.characters} limit={6} /> }] : []),
          ...(manga.staffCredits.length ? [{ id: "staff", label: "Staff", content: <StaffSection credits={manga.staffCredits} />, generalContent: <StaffSection credits={manga.staffCredits} limit={3} /> }] : []),
          ...(manga.relatedWorks.length ? [{ id: "relacionados", label: "Relacionados", content: <RelatedSection works={manga.relatedWorks} />, generalContent: <RelatedSection works={manga.relatedWorks} limit={3} /> }] : []),
          { id: "comentarios", label: "Reviews", content: <ReviewCommentsSection comments={workReviewComments} /> },
        ]}
      />
    </main>
  </div></AdultContentGate>;
}
