import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { FaStar } from "react-icons/fa";
import { FiActivity, FiClock } from "react-icons/fi";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { PiTelevisionSimple } from "react-icons/pi";

import { AnimeTrackerPanel } from "./components/AnimeTrackerPanel/AnimeTrackerPanel";
import { assetUrl } from "@/shared/auth/api";
import styles from "./animeslug.module.css";
import { AnisongSection } from "@/shared/components/AnisongSection/page";
import { AdultContentGate } from "@/shared/components/AdultContentGate/page";
import { CharacterSection } from "@/shared/components/CharacterSection/page";
import { FormatSidebarInfo } from "@/shared/components/FormatSidebarInfo/page";
import { HeroSection } from "@/shared/components/HeroSection/page";
import { RelatedSection } from "@/shared/components/RelatedSection/page";
import { ReviewCommentsSection, type PublicWorkReview } from "@/shared/components/ReviewCommentsSection/page";
import { SeasonSection, type AnimeSeason } from "@/shared/components/SeasonSection/page";
import { StaffSection } from "@/shared/components/StaffSection/page";
import { WorkSectionTabs } from "@/shared/components/WorkSectionTabs/page";
import type { AnimeEntity, AnimeReleaseFormat } from "@/shared/types/entities";
import { formatAnimeReleaseFormats, getUniqueAnimeReleaseFormats } from "@/shared/types/entities";

export const dynamic = "force-dynamic";

type Installment = {
  id: string; order: number; title: string; label: string; format: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
  synopsis: string; coverUrl: string | null; episodes: number; durationMinutes: number | null;
  status: "ANNOUNCED" | "AIRING" | "FINISHED" | "CANCELLED"; startDate: string | null; endDate: string | null;
  broadcastSeason: string | null; broadcastDay: "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | null; broadcastTime: string | null;
  studio: { id: string; displayName: string; slug: string; imageUrl: string } | null;
  studioName: string | null;
};
type AnimeStaffCredit = { role: string; contribution: string | null; person: { id: string; displayName: string; slug: string; imageUrl: string | null; roles: string[] } };
type AnimeCharacterCredit = {
  character: { id: string; nameRomaji: string; slug: string; imageUrl: string };
  seiyuu: { id: string; displayName: string; slug: string; imageUrl: string | null };
};
type AnimeSongCredit = {
  songTitle: string;
  featuredArtists: Array<{ id: string; displayName: string; slug: string; imageUrl: string }>;
  type: "OPENING" | "ENDING" | "INSERT";
  sequence: number | null;
  episodeRange: string | null;
  artist: { id: string; displayName: string; slug: string; imageUrl: string; kind: "SOLO" | "BAND" };
};
type AnimeData = {
  title: string; synopsis: string; coverUrl: string; alternativeTitles: AnimeEntity["alternativeTitles"];
  genres: string[]; producers: string[]; demography: string | null; rating: string | null; adultContent: boolean;
  externalLinks: NonNullable<AnimeEntity["externalLinks"]>; streamingLinks: NonNullable<AnimeEntity["streamingLinks"]>;
  installments: Installment[];
  staffCredits: AnimeStaffCredit[];
  characterCredits: AnimeCharacterCredit[];
  songCredits: AnimeSongCredit[];
  reviewSummary: { average: number; count: number };
  relatedWorks: Array<{ id: string; relationType: string; title: string; href: string; coverUrl: string | null; medium: string; status: string | null }>;
};
type AnimeQueryData = { anime: AnimeData | null; workReviewComments: PublicWorkReview[] };

const query = `query Anime($slug: String!, $includeAdult: Boolean!) {
  anime(slug: $slug, includeAdult: $includeAdult) {
  title synopsis coverUrl alternativeTitles { type title } genres producers demography rating adultContent
  externalLinks { website x instagram pixiv youtube }
  streamingLinks { crunchyroll netflix primeVideo bilibili retrocrush hulu hidive uNext abemaTv adn museAsia laftel tver iqiyi tubi dAnimeStore }
  installments { id order title label format synopsis coverUrl episodes durationMinutes status startDate endDate broadcastSeason broadcastDay broadcastTime studio { id displayName slug imageUrl } studioName }
  characterCredits {
    character { id nameRomaji slug imageUrl }
    seiyuu { id displayName slug imageUrl }
  }
  songCredits {
    songTitle type sequence episodeRange
    artist { id displayName slug imageUrl kind }
    featuredArtists { id displayName slug imageUrl }
  }
  staffCredits { role contribution person { id displayName slug imageUrl roles } }
  relatedWorks { id relationType title href coverUrl medium status }
    reviewSummary { average count }
  }
  workReviewComments(medium: ANIME, slug: $slug) {
    id score comment updatedAt
    author { username displayName avatarUrl }
  }
}`;

const formatMap: Record<Installment["format"], AnimeReleaseFormat> = {
  TV: "tv", MOVIE: "movie", OVA: "ova", ONA: "ona", SPECIAL: "special",
};
const statusMap = { ANNOUNCED: "Anunciado", AIRING: "Em exibição", FINISHED: "Finalizado", CANCELLED: "Cancelado" } as const;
const broadcastDayLabels = { SUNDAY: "Domingo", MONDAY: "Segunda-feira", TUESDAY: "Terça-feira", WEDNESDAY: "Quarta-feira", THURSDAY: "Quinta-feira", FRIDAY: "Sexta-feira", SATURDAY: "Sábado" } as const;

function displayDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function episodeRangeLabel(value: string | null) {
  const normalized = value?.replace(/^(?:eps?\.?|episódios?)\s*/i, "").trim();
  return normalized ? ` (Episódios ${normalized})` : "";
}

async function getAnime(slug: string, includeAdult: boolean) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/graphql`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { slug, includeAdult } }), cache: "no-store",
  });
  if (!response.ok) throw new Error("Não foi possível carregar o anime");
  const body = await response.json() as { data?: AnimeQueryData };
  return body.data ?? null;
}

export default async function AnimeBySlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const data = await getAnime(slug, includeAdult);
  if (!data?.anime) notFound();
  const { anime, workReviewComments } = data;

  const installments = [...anime.installments].sort((a, b) => a.order - b.order);
  const sourceWork = anime.relatedWorks.find((work) => work.relationType === "SOURCE_MATERIAL");
  const seasons: AnimeSeason[] = installments.map((item, index) => ({
    id: index + 1, title: item.title, label: item.label, cover: item.coverUrl || anime.coverUrl,
    episodes: item.episodes, watchedEpisodes: 0, status: statusMap[item.status], releaseFormat: formatMap[item.format],
    start: displayDate(item.startDate), end: item.endDate ? displayDate(item.endDate) : item.status === "AIRING" ? "Presente" : "—",
    duration: item.durationMinutes ? `${item.durationMinutes} min por episódio` : "Não informado",
    studio: item.studio?.displayName || item.studioName || "Não informado",
    broadcastSeason: item.broadcastSeason || "Não informada",
    broadcastSchedule: item.broadcastDay && item.broadcastTime ? `${broadcastDayLabels[item.broadcastDay]} às ${item.broadcastTime} hs (JST)` : "Não informada",
    source: sourceWork?.title || "Original", synopsis: item.synopsis,
  }));
  const starts = installments.map((item) => item.startDate).filter((value): value is string => Boolean(value)).sort();
  const ends = installments.map((item) => item.endDate).filter((value): value is string => Boolean(value)).sort();
  const studioNames = [...new Set(installments.map((item) => item.studio?.displayName || item.studioName).filter((value): value is string => Boolean(value)))];
  const studioLinks = studioNames.map((displayName) => ({ displayName, slug: installments.find((item) => item.studio?.displayName === displayName)?.studio?.slug }));
  const status = installments.some((item) => item.status === "AIRING") ? "Em exibição"
    : installments.some((item) => item.status === "ANNOUNCED") ? "Anunciado"
      : installments.some((item) => item.status === "FINISHED") ? "Finalizado" : "Cancelado";
  const duration = installments.find((item) => item.durationMinutes)?.durationMinutes;
  const entity: AnimeEntity = {
    cover: anime.coverUrl, title: anime.title, description: anime.synopsis, alternativeTitles: anime.alternativeTitles,
    entityType: "work", medium: "anime", episodes: seasons.reduce((total, season) => total + season.episodes, 0),
    status, start: displayDate(starts[0] ?? null), end: displayDate(ends.at(-1) ?? null),
    season: installments[0]?.format === "TV" ? installments[0].broadcastSeason || "Não informada" : undefined,
    studio: studioNames.join(", ") || "Não informado", studioLinks,
    producers: anime.producers, demography: anime.demography ?? undefined, genders: anime.genres,
    duration: duration ? `${duration} min por episódio` : "Não informada", score: anime.reviewSummary.average,
    rating: anime.rating || "Não informada", externalLinks: anime.externalLinks,
    streamingLinks: anime.streamingLinks,
  };
  const formats = getUniqueAnimeReleaseFormats(seasons.map((season) => season.releaseFormat));
  const hasKnownEpisodeTotal = seasons.every((season) => season.episodes > 0);
  const showSeasonsSection = seasons.length > 1;
  const songTypeLabels = { OPENING: "Opening", ENDING: "Ending", INSERT: "Insert song" } as const;
  const songs = anime.songCredits.map((credit) => ({
    title: `${songTypeLabels[credit.type]}${credit.sequence ? ` ${credit.sequence}` : ""}${episodeRangeLabel(credit.episodeRange)}`,
    href: `/artist/${credit.artist.slug}`,
    image: assetUrl(credit.artist.imageUrl) ?? credit.artist.imageUrl,
    imageAlt: credit.artist.displayName,
    imageLayout: credit.artist.kind === "BAND" ? "landscape" as const : "portrait" as const,
    details: [
      { icon: "song" as const, text: credit.songTitle },
      {
        icon: "artist" as const,
        text: [credit.artist.displayName, ...credit.featuredArtists.map((artist) => artist.displayName)].join(" feat. "),
      },
    ],
  }));

  const isAdultContent = anime.adultContent || anime.rating === "R18" || anime.rating === "R+" || anime.rating === "Rx";

  return <AdultContentGate blocked={isAdultContent && !includeAdult}><div className={styles.page}>
    <HeroSection
      entity={entity}
      animeTracker={{
        workKey: slug,
        seasons: seasons.map((season) => ({ id: season.id, episodes: season.episodes })),
      }}
    />
    <div className={styles.factsBar} aria-label="Resumo do anime">
      <div className={styles.factItem}><PiTelevisionSimple aria-hidden="true" /><span><small>Formato</small>{formatAnimeReleaseFormats(formats)}</span></div>
      <div className={styles.factItem}><MdOutlineVideoLibrary aria-hidden="true" /><span><small>Episódios</small>{hasKnownEpisodeTotal ? `${entity.episodes} episódios` : "Não Listado"}</span></div>
      <div className={styles.factItem}><FiClock aria-hidden="true" /><span><small>Duração</small>{entity.duration}</span></div>
      <div className={styles.factItem}><FiActivity aria-hidden="true" /><span><small>Status</small>{entity.status}</span></div>
      <div className={styles.factItem}><FaStar aria-hidden="true" /><span><small>Score</small>{entity.score.toFixed(1)}</span></div>
    </div>
    <main className={styles.animeSlugContainer}>
      <WorkSectionTabs
        classes={styles}
        sidebar={<FormatSidebarInfo entity={entity} reviewTarget={{ medium: "ANIME", slug, title: anime.title }} />}
        tracker={<AnimeTrackerPanel seasons={seasons} workKey={slug} />}
        sections={[
          ...(showSeasonsSection ? [{ id: "temporadas" as const, label: "Temporadas", content: <SeasonSection seasons={seasons} workKey={slug} /> }] : []),
          { id: "personagens", label: "Personagens", content: <CharacterSection credits={anime.characterCredits} /> },
          ...(anime.staffCredits.length > 0 ? [{ id: "staff" as const, label: "Staff", content: <StaffSection credits={anime.staffCredits} /> }] : []),
          ...(songs.length > 0 ? [{ id: "musicas" as const, label: "Músicas", content: <AnisongSection songs={songs} /> }] : []),
          ...(anime.relatedWorks.length > 0 ? [{ id: "relacionados" as const, label: "Relacionados", content: <RelatedSection works={anime.relatedWorks} /> }] : []),
          { id: "comentarios", label: "Reviews", content: <ReviewCommentsSection comments={workReviewComments} /> },
        ]}
      />
    </main>
  </div></AdultContentGate>;
}
