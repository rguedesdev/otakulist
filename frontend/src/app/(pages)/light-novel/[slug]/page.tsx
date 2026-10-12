import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { BiHash } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { LuBookHeart, LuCalendarRange } from "react-icons/lu";
import { VscLibrary } from "react-icons/vsc";

import styles from "./lightnovelslug.module.css";
import { LightNovelTrackerPanel } from "./components/LightNovelTrackerPanel/LightNovelTrackerPanel";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { AdultContentGate } from "@/shared/components/AdultContentGate/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import { PublicationCharacterSection, type PublicationCharacter } from "@/shared/components/PublicationCharacterSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { ReviewCommentsSection, type PublicWorkReview } from "@/shared/components/ReviewCommentsSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { WorkSectionTabs } from "@/shared/components/WorkSectionTabs/page";
import type { LightNovelEntity } from "@/shared/types/entities";

export const dynamic = "force-dynamic";

type NovelData = {
  title: string; synopsis: string; coverUrl: string; alternativeTitles: LightNovelEntity["alternativeTitles"];
  status: string; adultContent: boolean; startDate: string | null; endDate: string | null; publisher: string | null; publisherEntity: { displayName: string; slug: string } | null; source: string | null;
  genres: string[]; chapters: number; volumes: number;
  externalLinks: NonNullable<LightNovelEntity["externalLinks"]>; storeLinks: NonNullable<LightNovelEntity["storeLinks"]>;
  reviewSummary: { average: number; count: number }; characters: PublicationCharacter[];
  staffCredits: Array<{ role: string; contribution: string | null; person: { id: string; displayName: string; slug: string; imageUrl: string | null; roles: string[] } }>;
  relatedWorks: Array<{ id: string; relationType: string | null; title: string; href: string; coverUrl: string | null; medium: string; status: string | null }>;
};

const query = `query LightNovel($slug: String!, $includeAdult: Boolean!) {
  lightNovel(slug: $slug, includeAdult: $includeAdult) {
    title synopsis coverUrl alternativeTitles { type title } status adultContent startDate endDate publisher publisherEntity { displayName slug } source genres chapters volumes
    externalLinks { website x instagram pixiv youtube tiktok }
    storeLinks { amazon cdJapan mercadoLivre rakuten shopee ebay otakuyasan hmv honto toranoana animate }
    reviewSummary { average count }
    characters { id nameRomaji slug imageUrl }
    staffCredits { role contribution person { id displayName slug imageUrl roles } }
    relatedWorks { id relationType title href coverUrl medium status }
  }
  workReviewComments(medium: LIGHT_NOVEL, slug: $slug) { id score comment updatedAt author { username displayName avatarUrl } }
}`;
const statuses: Record<string, string> = { ANNOUNCED: "Anunciada", PUBLISHING: "Em publicação", HIATUS: "Em hiato", FINISHED: "Finalizada", CANCELLED: "Cancelada" };

function displayDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(date);
  const month = ["Jan", "Fev", "Mar", "Abril", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][date.getUTCMonth()];
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "UTC" }).format(date);
  return `${day} ${month} ${year}`;
}

export default async function LightNovelBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { slug, includeAdult } }), cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar a light novel");
  const body = await response.json() as { data?: { lightNovel: NovelData | null; workReviewComments: PublicWorkReview[] } };
  const novel = body.data?.lightNovel;
  if (!novel) notFound();
  const publicationEnd = novel.endDate
    ? displayDate(novel.endDate)
    : novel.status === "PUBLISHING"
      ? "Presente"
      : "—";
  const entity: LightNovelEntity = {
    cover: novel.coverUrl, title: novel.title, description: novel.synopsis, alternativeTitles: novel.alternativeTitles,
    entityType: "work", medium: "light_novel", score: novel.reviewSummary.average, status: statuses[novel.status] ?? novel.status,
    start: displayDate(novel.startDate),
    end: displayDate(novel.endDate),
    publisher: novel.publisherEntity?.displayName ?? novel.publisher ?? undefined,
    publisherLink: novel.publisherEntity ?? undefined,
    source: novel.source ?? undefined, genders: novel.genres, chapters: novel.chapters, volumes: novel.volumes,
    publicationPeriod: `${displayDate(novel.startDate)} ~ ${publicationEnd}`,
    externalLinks: novel.externalLinks, storeLinks: novel.storeLinks,
  };
  return <AdultContentGate blocked={novel.adultContent && !includeAdult}><div className={styles.page}>
    <HeroSection entity={entity} publicationTracker={{ medium: "LIGHT_NOVEL", workKey: slug }} />
    <div className={styles.factsBar} aria-label="Resumo da light novel">
      <div className={styles.factItem}><LuBookHeart /><span><small>Formato</small>Light Novel</span></div>
      <div className={styles.factItem}><BiHash /><span><small>Capítulos</small>{entity.chapters > 0 ? `${entity.chapters} capítulos` : "Total em aberto"}</span></div>
      <div className={styles.factItem}><VscLibrary /><span><small>Volumes</small>{entity.volumes} publicados</span></div>
      <div className={styles.factItem}><LuCalendarRange /><span><small>Publicação</small>{entity.publicationPeriod}</span></div>
      <div className={styles.factItem}><FaStar /><span><small>Score</small>{entity.score.toFixed(1)}</span></div>
    </div>
    <main className={styles.lightNovelSlugContainer}>
      <WorkSectionTabs classes={styles} sidebar={<FormatSidebarInfo entity={entity} reviewTarget={{ medium: "LIGHT_NOVEL", slug, title: novel.title }} />} tracker={<LightNovelTrackerPanel totalChapters={entity.chapters} workKey={slug} />} sections={[
        ...(novel.characters.length ? [{ id: "personagens", label: "Personagens", content: <PublicationCharacterSection characters={novel.characters} /> }] : []),
        ...(novel.staffCredits.length ? [{ id: "staff", label: "Staff", content: <StaffSection credits={novel.staffCredits} /> }] : []),
        ...(novel.relatedWorks.length ? [{ id: "relacionados", label: "Relacionados", content: <RelatedSection works={novel.relatedWorks} /> }] : []),
        { id: "comentarios", label: "Reviews", content: <ReviewCommentsSection comments={body.data?.workReviewComments ?? []} /> },
      ]} />
    </main>
  </div></AdultContentGate>;
}
