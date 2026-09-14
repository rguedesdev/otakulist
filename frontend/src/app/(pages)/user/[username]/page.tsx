import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCalendar, FiClock, FiSearch, FiTv } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart, LuSquareLibrary } from "react-icons/lu";
import { RiBookmark3Line, RiHome5Line } from "react-icons/ri";

import styles from "./userprofile.module.css";
import { LocalAnimeListMigration } from "./LocalAnimeListMigration";
import { EditProfileAction } from "./EditProfileAction";
import { SlidingLinkTabs } from "@/shared/components/SlidingLinkTabs/page";

type ProfileTab = "overview" | "anime" | "manga" | "novel";
type UserRole = "FREE" | "VIP" | "ZEUS";

interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

interface AnimeListItem {
  id: string;
  status: "PLANNED" | "WATCHING" | "PAUSED" | "COMPLETED" | "DROPPED";
  score: number | null;
  updatedAt: string;
  seasonProgress: Array<{ order: number; watchedEpisodes: number }>;
  anime: { title: string; slug: string; coverUrl: string; genres: string[]; installments: Array<{ episodes: number; format: string }> };
}

interface PublicationListItem {
  id: string;
  status: "PLANNED" | "READING" | "PAUSED" | "COMPLETED" | "DROPPED";
  readChapters: number;
  totalChapters: number;
  genres: string[];
  updatedAt: string;
  work: { title: string; slug: string; coverUrl: string; medium: "MANGA" | "LIGHT_NOVEL"; href: string };
}

interface UserReviewItem {
  id: string;
  score: number;
  updatedAt: string;
  work: { title: string; slug: string; medium: "ANIME" | "MANGA" | "LIGHT_NOVEL"; href: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const validTabs = new Set<ProfileTab>(["overview", "anime", "manga", "novel"]);

function getSelectedTab(value: string | string[] | undefined): ProfileTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab && validTabs.has(tab as ProfileTab) ? (tab as ProfileTab) : "overview";
}

async function getProfile(username: string): Promise<{ user: PublicUser | null; animeList: AnimeListItem[]; mangaList: PublicationListItem[]; novelList: PublicationListItem[]; reviews: UserReviewItem[] }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query PublicProfile($username: String!) {
            user(username: $username) {
              id username displayName bio role avatarUrl createdAt
            }
            animeList(username: $username) {
              id status score updatedAt seasonProgress { order watchedEpisodes }
              anime { title slug coverUrl genres installments { episodes format } }
            }
            mangaList: publicationList(username: $username, medium: MANGA) {
              id status readChapters totalChapters genres updatedAt
              work { title slug coverUrl medium href }
            }
            novelList: publicationList(username: $username, medium: LIGHT_NOVEL) {
              id status readChapters totalChapters genres updatedAt
              work { title slug coverUrl medium href }
            }
            userReviews(username: $username) {
              id score updatedAt
              work { title slug medium href }
            }
          }
        `,
        variables: { username },
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Backend indisponível em http://localhost:5000");
  }

  const result = (await response.json().catch(() => null)) as {
    data?: { user: PublicUser | null; animeList: AnimeListItem[]; mangaList: PublicationListItem[]; novelList: PublicationListItem[]; userReviews: UserReviewItem[] };
    errors?: Array<{ message: string }>;
  } | null;

  if (result?.errors?.length) throw new Error(result.errors[0]?.message ?? "Erro ao carregar perfil");
  if (!response.ok || !result) throw new Error(`Backend respondeu com HTTP ${response.status}`);
  return {
    user: result.data?.user ?? null,
    animeList: result.data?.animeList ?? [],
    mangaList: result.data?.mangaList ?? [],
    novelList: result.data?.novelList ?? [],
    reviews: result.data?.userReviews ?? [],
  };
}

const animeStatusLabels: Record<AnimeListItem["status"], string> = {
  PLANNED: "Planejo assistir", WATCHING: "Assistindo", PAUSED: "Pausado", COMPLETED: "Completo", DROPPED: "Dropado",
};

const publicationStatusLabels: Record<PublicationListItem["status"], string> = {
  PLANNED: "Planejo ler", READING: "Lendo", PAUSED: "Pausado", COMPLETED: "Completo", DROPPED: "Dropado",
};

const formatLabels: Record<string, string> = { TV: "TV", MOVIE: "Filme", OVA: "OVA", ONA: "ONA", SPECIAL: "Especial" };

function LibraryColumnsHeader() {
  return (
    <div className={styles.listHeader} aria-hidden="true">
      <span>Título</span>
      <span className={styles.progressColumn}>Progresso</span>
      <span className={styles.statusColumn}>Status</span>
      <span className={styles.scoreColumn}>Score</span>
    </div>
  );
}

function AnimeLibraryList({ entries, reviewScores }: { entries: AnimeListItem[]; reviewScores: Map<string, number> }) {
  return (
    <section className={styles.libraryPanel} aria-labelledby="library-title">
      <div className={styles.libraryHeading}>
        <div><h2 id="library-title">Anime list</h2><p>Episódios assistidos, scores e status dos seus animes.</p></div>
        <span className={styles.titleCount}>{entries.length} títulos</span>
      </div>
      <div className={styles.listToolbar}>
        <div className={styles.statusFilters} aria-label="Filtrar por status">
          <button className={styles.filterActive} type="button">Todos</button><button type="button">Em andamento</button><button type="button">Completos</button><button type="button">Planejados</button>
        </div>
        <label className={styles.searchField}><FiSearch aria-hidden="true" /><span className={styles.srOnly}>Buscar nesta lista</span><input type="search" placeholder="Buscar na lista" /></label>
      </div>
      <LibraryColumnsHeader />
      <div className={styles.listItems}>
        {entries.map((entry) => {
          const watched = entry.seasonProgress.reduce((total, season) => total + season.watchedEpisodes, 0);
          const episodes = entry.anime.installments.reduce((total, installment) => total + installment.episodes, 0);
          const formats = [...new Set(entry.anime.installments.map((installment) => formatLabels[installment.format] ?? installment.format))].join(" · ");
          const cover = entry.anime.coverUrl.startsWith("http") ? entry.anime.coverUrl : `${API_URL}${entry.anime.coverUrl}`;
          const status = animeStatusLabels[entry.status];
          const score = reviewScores.get(entry.anime.slug) ?? null;
          return <article className={styles.listItem} key={entry.id}>
            <Link className={styles.itemIdentity} href={`/anime/${entry.anime.slug}`}>
              <Image src={cover} alt={`Capa de ${entry.anime.title}`} width={58} height={82} unoptimized />
              <span><strong>{entry.anime.title}</strong><small>{formats} • {episodes} episódios</small><span className={styles.itemGenres}>{entry.anime.genres.map((genre) => <em key={genre}>{genre}</em>)}</span></span>
            </Link>
            <span className={styles.itemProgress}>{watched} / {episodes} episódios</span>
            <span className={`${styles.itemStatus} ${styles[`status${status}`]}`}>{status}</span>
            <span className={styles.itemScore}>
              {score === null ? "—" : <><span className={styles.itemScoreStar} aria-hidden="true">★</span>{score.toFixed(1)}</>}
            </span>
          </article>;
        })}
      </div>
      <p className={styles.listFootnote}>Exibindo {entries.length} de {entries.length} títulos.</p>
    </section>
  );
}

function PublicationLibraryList({
  entries,
  medium,
  reviewScores,
}: {
  entries: PublicationListItem[];
  medium: "MANGA" | "LIGHT_NOVEL";
  reviewScores: Map<string, number>;
}) {
  const title = medium === "MANGA" ? "Manga list" : "Novel list";
  const description = medium === "MANGA"
    ? "Capítulos lidos, scores e status dos seus mangas."
    : "Capítulos lidos, scores e status das suas light novels.";

  return (
    <section className={styles.libraryPanel} aria-labelledby="publication-library-title">
      <div className={styles.libraryHeading}>
        <div><h2 id="publication-library-title">{title}</h2><p>{description}</p></div>
        <span className={styles.titleCount}>{entries.length} títulos</span>
      </div>
      <div className={styles.listToolbar}>
        <div className={styles.statusFilters} aria-label="Filtrar por status">
          <button className={styles.filterActive} type="button">Todos</button><button type="button">Em andamento</button><button type="button">Completos</button><button type="button">Planejados</button>
        </div>
        <label className={styles.searchField}><FiSearch aria-hidden="true" /><span className={styles.srOnly}>Buscar nesta lista</span><input type="search" placeholder="Buscar na lista" /></label>
      </div>
      <LibraryColumnsHeader />
      <div className={styles.listItems}>
        {entries.map((entry) => {
          const cover = entry.work.coverUrl.startsWith("http") ? entry.work.coverUrl : `${API_URL}${entry.work.coverUrl}`;
          const status = publicationStatusLabels[entry.status];
          const score = reviewScores.get(entry.work.slug) ?? null;
          const mediumLabel = medium === "MANGA" ? "Manga" : "Light Novel";
          return <article className={styles.listItem} key={entry.id}>
            <Link className={styles.itemIdentity} href={entry.work.href}>
              <Image src={cover} alt={`Capa de ${entry.work.title}`} width={58} height={82} unoptimized />
              <span><strong>{entry.work.title}</strong><small>{mediumLabel} • {entry.totalChapters} capítulos</small><span className={styles.itemGenres}>{entry.genres.map((genre) => <em key={genre}>{genre}</em>)}</span></span>
            </Link>
            <span className={styles.itemProgress}>{entry.readChapters} / {entry.totalChapters} capítulos</span>
            <span className={`${styles.itemStatus} ${styles[`status${status}`]}`}>{status}</span>
            <span className={styles.itemScore}>
              {score === null ? "—" : <><span className={styles.itemScoreStar} aria-hidden="true">★</span>{score.toFixed(1)}</>}
            </span>
          </article>;
        })}
      </div>
      <p className={styles.listFootnote}>Exibindo {entries.length} de {entries.length} títulos.</p>
    </section>
  );
}

function Overview({ profileBase, animeList, mangaList, novelList, reviews }: { profileBase: string; animeList: AnimeListItem[]; mangaList: PublicationListItem[]; novelList: PublicationListItem[]; reviews: UserReviewItem[] }) {
  const watching = animeList.filter((entry) => entry.status === "WATCHING").length;
  const readingMangas = mangaList.filter((entry) => entry.status === "READING").length;
  const readingNovels = novelList.filter((entry) => entry.status === "READING").length;
  const recentActivity = [
    ...animeList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.anime.title, updatedAt: entry.updatedAt })),
    ...mangaList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.work.title, updatedAt: entry.updatedAt })),
    ...novelList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.work.title, updatedAt: entry.updatedAt })),
    ...reviews.map((review) => ({ id: `review-${review.id}`, kind: "review" as const, title: review.work.title, score: review.score, updatedAt: review.updatedAt })),
  ].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()).slice(0, 4);
  return <div className={styles.overviewGrid}>
    <section className={styles.overviewPanel} aria-labelledby="library-overview-title">
      <div className={styles.panelHeading}><div><span className={styles.kicker}>Sua jornada</span><h2 id="library-overview-title">Resumo da biblioteca</h2></div><FiClock aria-hidden="true" /></div>
      <div className={styles.librarySummaries}>
        <Link href={`${profileBase}?tab=anime`}><span className={styles.summaryIcon}><FiTv aria-hidden="true" /></span><span className={styles.summaryCopy}><strong>Anime list</strong><small>{watching} assistindo agora</small></span><span className={styles.summaryValue}>{animeList.length}</span></Link>
        <Link href={`${profileBase}?tab=manga`}><span className={styles.summaryIcon}><GiEvilBook aria-hidden="true" /></span><span className={styles.summaryCopy}><strong>Manga list</strong><small>{readingMangas} lendo agora</small></span><span className={styles.summaryValue}>{mangaList.length}</span></Link>
        <Link href={`${profileBase}?tab=novel`}><span className={styles.summaryIcon}><LuBookHeart aria-hidden="true" /></span><span className={styles.summaryCopy}><strong>Novel list</strong><small>{readingNovels} lendo agora</small></span><span className={styles.summaryValue}>{novelList.length}</span></Link>
      </div>
    </section>
    <section className={styles.overviewPanel} aria-labelledby="activity-title">
      <div className={styles.panelHeading}><div><span className={styles.kicker}>Últimos registros</span><h2 id="activity-title">Atividade recente</h2></div><RiBookmark3Line aria-hidden="true" /></div>
      <div className={styles.activityList}>
        {recentActivity.map((activity) => (
          <div key={activity.id}>
            <span className={styles.activityMarker} />
            <p>
              {activity.kind === "review"
                ? <>Avaliou <strong>{activity.title}</strong> com <strong>★ {activity.score.toFixed(1)}</strong></>
                : <>Atualizou o progresso de <strong>{activity.title}</strong></>}
            </p>
            <time dateTime={activity.updatedAt}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(activity.updatedAt))}</time>
          </div>
        ))}
      </div>
    </section>
  </div>;
}

function membershipLabel(role: UserRole) {
  if (role === "VIP") return "Membro VIP";
  if (role === "ZEUS") return "Equipe OtakuList";
  return "Membro gratuito";
}

function emptyState(tab: ProfileTab) {
  switch (tab) {
    case "anime":
      return ["Anime list", "Nenhum anime adicionado até o momento."];
    case "manga":
      return ["Manga list", "Nenhum manga adicionado até o momento."];
    case "novel":
      return ["Novel list", "Nenhuma light novel adicionada até o momento."];
    default:
      return ["Biblioteca vazia", "As atividades e estatísticas aparecerão quando obras forem adicionadas."];
  }
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const { user, animeList, mangaList, novelList, reviews } = await getProfile(username);
  if (!user) notFound();

  const selectedTab = getSelectedTab(query.tab);
  const profileBase = `/user/${encodeURIComponent(user.username)}`;
  const [emptyTitle, emptyDescription] = emptyState(selectedTab);
  const joinedAt = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(user.createdAt));
  const avatarUrl = user.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${API_URL}${user.avatarUrl}`
    : null;

  const tabs: Array<{ id: ProfileTab; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Visão geral", icon: <RiHome5Line aria-hidden="true" /> },
    { id: "anime", label: "Anime list", icon: <FiTv aria-hidden="true" /> },
    { id: "manga", label: "Manga list", icon: <GiEvilBook aria-hidden="true" /> },
    { id: "novel", label: "Novel list", icon: <LuBookHeart aria-hidden="true" /> },
  ];
  const emptyIcons: Record<ProfileTab, React.ReactNode> = {
    overview: <LuSquareLibrary aria-hidden="true" />,
    anime: <FiTv aria-hidden="true" />,
    manga: <GiEvilBook aria-hidden="true" />,
    novel: <LuBookHeart aria-hidden="true" />,
  };
  const totalWatchedEpisodes = animeList.reduce((total, entry) => total + entry.seasonProgress.reduce((sum, season) => sum + season.watchedEpisodes, 0), 0);
  const animeReviewScores = new Map(reviews.filter((review) => review.work.medium === "ANIME").map((review) => [review.work.slug, review.score]));
  const mangaReviewScores = new Map(reviews.filter((review) => review.work.medium === "MANGA").map((review) => [review.work.slug, review.score]));
  const novelReviewScores = new Map(reviews.filter((review) => review.work.medium === "LIGHT_NOVEL").map((review) => [review.work.slug, review.score]));

  return (
    <main className={styles.page}>
      <LocalAnimeListMigration profileUserId={user.id} />
      <div className={styles.profileContainer}>
        <section className={styles.profileHero} aria-labelledby="profile-name">
          <div className={styles.coverPattern} aria-hidden="true" />
          <div className={styles.profileMain}>
            <div
              className={styles.avatar}
              role="img"
              aria-label={`Avatar de ${user.displayName}`}
              style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined}
            >
              {!avatarUrl && user.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className={styles.profileIdentity}>
              <span className={styles.kicker}>{membershipLabel(user.role)}</span>
              <h1 id="profile-name">{user.displayName}</h1>
              <p className={styles.username}>@{user.username}</p>
              {user.bio && (
                <div className={styles.bioBlock}>
                  <span>Bio</span>
                  <p className={styles.bio}>{user.bio}</p>
                </div>
              )}
              <div className={styles.profileMeta}>
                <span>
                  <FiCalendar aria-hidden="true" />
                  Membro desde {joinedAt}
                </span>
              </div>
              <EditProfileAction username={user.username} />
            </div>
          </div>

          <div className={styles.profileStats}>
            <div><strong>{animeList.length}</strong><span>Animes</span></div>
            <div><strong>{mangaList.length}</strong><span>Mangas</span></div>
            <div><strong>{novelList.length}</strong><span>Novels</span></div>
            <div><strong>0</strong><span>Amigos</span></div>
            <div><strong>0</strong><span>Dias assistidos</span></div>
            <div><strong>{totalWatchedEpisodes}</strong><span>Episódios</span></div>
          </div>
        </section>

        <SlidingLinkTabs
          className={styles.profileNav}
          activeClassName={styles.profileNavActive}
          activeId={selectedTab}
          tabs={tabs.map((tab) => ({ ...tab, href: tab.id === "overview" ? profileBase : `${profileBase}?tab=${tab.id}` }))}
        />

        <div className={styles.profileContent}>
          {selectedTab === "overview" && (animeList.length > 0 || mangaList.length > 0 || novelList.length > 0 || reviews.length > 0) ? <Overview profileBase={profileBase} animeList={animeList} mangaList={mangaList} novelList={novelList} reviews={reviews} />
            : selectedTab === "anime" && animeList.length > 0 ? <AnimeLibraryList entries={animeList} reviewScores={animeReviewScores} />
              : selectedTab === "manga" && mangaList.length > 0 ? <PublicationLibraryList entries={mangaList} medium="MANGA" reviewScores={mangaReviewScores} />
                : selectedTab === "novel" && novelList.length > 0 ? <PublicationLibraryList entries={novelList} medium="LIGHT_NOVEL" reviewScores={novelReviewScores} />
              : <section className={styles.emptyState}>{emptyIcons[selectedTab]}<h2>{emptyTitle}</h2><p>{emptyDescription}</p></section>}
        </div>
      </div>
    </main>
  );
}
