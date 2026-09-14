import { notFound } from "next/navigation";
import { BiHash } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { GiEvilBook } from "react-icons/gi";
import { LuCalendarRange } from "react-icons/lu";
import { VscLibrary } from "react-icons/vsc";

import styles from "./mangaslug.module.css";
import { MangaTrackerPanel } from "./components/MangaTrackerPanel/MangaTrackerPanel";
import { PublicationCharacterSection, type PublicationCharacter } from "@/shared/components/PublicationCharacterSection/page";
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
  status: string; startDate: string | null; endDate: string | null; magazine: string | null; magazineEntity: { title: string; slug: string } | null;
  publisher: string | null; publisherEntity: { displayName: string; slug: string } | null; demography: string | null; genres: string[]; chapters: number;
  volumes: number; serialization: string | null; externalLinks: NonNullable<MangaEntity["externalLinks"]>;
  storeLinks: NonNullable<MangaEntity["storeLinks"]>;
  reviewSummary: { average: number; count: number };
  characters: PublicationCharacter[];
  staffCredits: Array<{ role: string; contribution: string | null; person: { id: string; displayName: string; slug: string; imageUrl: string | null; roles: string[] } }>;
  relatedWorks: Array<{ id: string; title: string; href: string; coverUrl: string | null; medium: string; status: string | null }>;
};
type MangaQueryData = { manga: MangaData | null; workReviewComments: PublicWorkReview[] };

const query = `query Manga($slug: String!) {
  manga(slug: $slug) {
    title synopsis coverUrl alternativeTitles { type title } status startDate endDate magazine magazineEntity { title slug } publisher publisherEntity { displayName slug }
    demography genres chapters volumes serialization externalLinks { website x instagram pixiv youtube }
    storeLinks { amazon cdJapan mercadoLivre rakuten shopee ebay otakuyasan hmv honto toranoana animate }
    reviewSummary { average count }
    characters { id nameRomaji slug imageUrl }
    staffCredits { role contribution person { id displayName slug imageUrl roles } }
    relatedWorks { id title href coverUrl medium status }
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
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

async function getManga(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug } }), cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o manga");
  const body = await response.json() as { data?: MangaQueryData };
  return body.data ?? null;
}

export default async function MangaBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getManga(slug);
  if (!data?.manga) notFound();
  const { manga, workReviewComments } = data;

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
    chapters: manga.chapters, volumes: manga.volumes, serialization: manga.serialization ?? "Não informada",
    externalLinks: manga.externalLinks, storeLinks: manga.storeLinks,
  };

  return <div className={styles.page}>
    <HeroSection entity={entity} publicationTracker={{ medium: "MANGA", workKey: slug }} />
    <div className={styles.factsBar} aria-label="Resumo do manga">
      <div className={styles.factItem}><GiEvilBook aria-hidden="true" /><span><small>Formato</small>Manga</span></div>
      <div className={styles.factItem}><BiHash aria-hidden="true" /><span><small>Capítulos</small>{entity.chapters} capítulos</span></div>
      <div className={styles.factItem}><VscLibrary aria-hidden="true" /><span><small>Volumes</small>{entity.volumes} publicados</span></div>
      <div className={styles.factItem}><LuCalendarRange aria-hidden="true" /><span><small>Serialização</small>{entity.serialization}</span></div>
      <div className={styles.factItem}><FaStar aria-hidden="true" /><span><small>Score</small>{entity.score.toFixed(2)}</span></div>
    </div>
    <main className={styles.mangaSlugContainer}>
      <WorkSectionTabs
        classes={styles}
        sidebar={<FormatSidebarInfo entity={entity} reviewTarget={{ medium: "MANGA", slug, title: manga.title }} />}
        tracker={<MangaTrackerPanel totalChapters={entity.chapters} workKey={slug} />}
        sections={[
          ...(manga.characters.length ? [{ id: "personagens", label: "Personagens", content: <PublicationCharacterSection characters={manga.characters} /> }] : []),
          ...(manga.staffCredits.length ? [{ id: "staff", label: "Staff", content: <StaffSection credits={manga.staffCredits} /> }] : []),
          ...(manga.relatedWorks.length ? [{ id: "relacionados", label: "Relacionados", content: <RelatedSection works={manga.relatedWorks} /> }] : []),
          { id: "comentarios", label: "Reviews", content: <ReviewCommentsSection comments={workReviewComments} /> },
        ]}
      />
    </main>
  </div>;
}
