import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { FiCalendar, FiClock, FiSearch, FiTv } from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart, LuSquareLibrary } from "react-icons/lu";
import { RiBookmark3Line, RiHome5Line } from "react-icons/ri";
import { MdFavorite } from "react-icons/md";

import styles from "./userprofile.module.css";
import { LocalAnimeListMigration } from "./LocalAnimeListMigration";
import { EditProfileAction } from "./EditProfileAction";
import { SlidingLinkTabs } from "@/shared/components/SlidingLinkTabs/page";

type ProfileTab = "overview" | "anime" | "manga" | "novel";
type LibraryFilter = "all" | "active" | "completed" | "planned" | "paused" | "dropped";
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
interface UserFavoriteItem {
  id: string;
  createdAt: string;
  work: { title: string; slug: string; coverUrl: string; medium: "ANIME" | "MANGA" | "LIGHT_NOVEL"; href: string };
}


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const validTabs = new Set<ProfileTab>(["overview", "anime", "manga", "novel"]);
const validLibraryFilters = new Set<LibraryFilter>(["all", "active", "completed", "planned", "paused", "dropped"]);

function getSelectedTab(value: string | string[] | undefined): ProfileTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab && validTabs.has(tab as ProfileTab) ? (tab as ProfileTab) : "overview";
}

function getSelectedFilter(value: string | string[] | undefined): LibraryFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filter && validLibraryFilters.has(filter as LibraryFilter) ? filter as LibraryFilter : "all";
}

async function getProfile(username: string, includeAdult: boolean, refreshToken?: string): Promise<{ user: PublicUser | null; animeList: AnimeListItem[]; mangaList: PublicationListItem[]; novelList: PublicationListItem[]; favorites: UserFavoriteItem[]; reviews: UserReviewItem[] }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(refreshToken ? { Cookie: `otakulist_refresh=${refreshToken}` } : {}),
      },
      body: JSON.stringify({
        query: `
          query PublicProfile($username: String!, $includeAdult: Boolean!) {
            user(username: $username) {
              id username displayName bio role avatarUrl createdAt
            }
            animeList(username: $username, includeAdult: $includeAdult) {
              id status score updatedAt seasonProgress { order watchedEpisodes }
              anime { title slug coverUrl genres installments { episodes format } }
            }
            mangaList: publicationList(username: $username, medium: MANGA, includeAdult: $includeAdult) {
              id status readChapters totalChapters genres updatedAt
              work { title slug coverUrl medium href }
            }
            novelList: publicationList(username: $username, medium: LIGHT_NOVEL, includeAdult: $includeAdult) {
              id status readChapters totalChapters genres updatedAt
              work { title slug coverUrl medium href }
            }
            userFavorites(username: $username, includeAdult: $includeAdult) {
              id createdAt
              work { title slug coverUrl medium href }
            }
            userReviews(username: $username, includeAdult: $includeAdult) {
              id score updatedAt
              work { title slug medium href }
            }
          }
        `,
        variables: { username, includeAdult },
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Backend indisponível em http://localhost:5000");
  }

  const result = (await response.json().catch(() => null)) as {
    data?: { user: PublicUser | null; animeList: AnimeListItem[]; mangaList: PublicationListItem[]; novelList: PublicationListItem[]; userFavorites: UserFavoriteItem[]; userReviews: UserReviewItem[] };
    errors?: Array<{ message: string }>;
  } | null;

  if (result?.errors?.length) throw new Error(result.errors[0]?.message ?? "Erro ao carregar perfil");
  if (!response.ok || !result) throw new Error(`Backend respondeu com HTTP ${response.status}`);
  return {
    user: result.data?.user ?? null,
    animeList: result.data?.animeList ?? [],
    mangaList: result.data?.mangaList ?? [],
    novelList: result.data?.novelList ?? [],
    favorites: result.data?.userFavorites ?? [],
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

function LibraryStatusFilters({ profileBase, tab, activeFilter }: { profileBase: string; tab: Exclude<ProfileTab, "overview">; activeFilter: LibraryFilter }) {
  const filters: Array<{ id: LibraryFilter; label: string }> = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Em andamento" },
    { id: "completed", label: "Completos" },
    { id: "planned", label: "Planejados" },
    { id: "paused", label: "Pausados" },
    { id: "dropped", label: "Dropados" },
  ];

  return <SlidingLinkTabs
    className={styles.statusFilters}
    activeClassName={styles.filterActive}
    activeId={activeFilter}
    ariaLabel="Filtrar obras por status"
    tabs={filters.map((filter) => ({
      ...filter,
      href: `${profileBase}?tab=${tab}${filter.id === "all" ? "" : `&status=${filter.id}`}`,
    }))}
  />;
}

function AnimeLibraryList({ entries, reviewScores, profileBase, activeFilter }: { entries: AnimeListItem[]; reviewScores: Map<string, number>; profileBase: string; activeFilter: LibraryFilter }) {
  const filteredEntries = entries.filter((entry) => {
    if (activeFilter === "active") return entry.status === "WATCHING";
    if (activeFilter === "completed") return entry.status === "COMPLETED";
    if (activeFilter === "planned") return entry.status === "PLANNED";
    if (activeFilter === "paused") return entry.status === "PAUSED";
    if (activeFilter === "dropped") return entry.status === "DROPPED";
    return true;
  });

  return (
    <section className={styles.libraryPanel} aria-labelledby="library-title">
      <div className={styles.libraryHeading}>
        <div><h2 id="library-title">Anime list</h2><p>Episódios assistidos, scores e status dos seus animes.</p></div>
        <span className={styles.titleCount}>{entries.length} títulos</span>
      </div>
      <div className={styles.listToolbar}>
        <LibraryStatusFilters profileBase={profileBase} tab="anime" activeFilter={activeFilter} />
        <label className={styles.searchField}><FiSearch aria-hidden="true" /><span className={styles.srOnly}>Buscar nesta lista</span><input type="search" autoComplete="off" placeholder="Buscar na lista" /></label>
      </div>
      <LibraryColumnsHeader />
      <div className={styles.listItems}>
        {filteredEntries.map((entry) => {
          const watched = entry.seasonProgress.reduce((total, season) => total + season.watchedEpisodes, 0);
          const episodes = entry.anime.installments.reduce((total, installment) => total + installment.episodes, 0);
          const hasKnownTotal = entry.anime.installments.every((installment) => installment.episodes > 0);
          const formats = [...new Set(entry.anime.installments.map((installment) => formatLabels[installment.format] ?? installment.format))].join(" · ");
          const cover = entry.anime.coverUrl.startsWith("http") ? entry.anime.coverUrl : `${API_URL}${entry.anime.coverUrl}`;
          const status = animeStatusLabels[entry.status];
          const score = reviewScores.get(entry.anime.slug) ?? null;
          return <article className={styles.listItem} key={entry.id}>
            <Link className={styles.itemIdentity} href={`/anime/${entry.anime.slug}`}>
              <Image src={cover} alt={`Capa de ${entry.anime.title}`} width={58} height={82} unoptimized />
              <span><strong>{entry.anime.title}</strong><small>{formats} • {hasKnownTotal ? `${episodes} episódios` : "Não Listado"}</small><span className={styles.itemGenres}>{entry.anime.genres.map((genre) => <em key={genre}>{genre}</em>)}</span></span>
            </Link>
            <span className={styles.itemProgress}>{watched} / {hasKnownTotal ? episodes : "-"} episódios</span>
            <span className={`${styles.itemStatus} ${styles[`status${status}`]}`}>{status}</span>
            <span className={styles.itemScore}>
              {score === null ? "—" : <><span className={styles.itemScoreStar} aria-hidden="true">★</span>{score.toFixed(1)}</>}
            </span>
          </article>;
        })}
        {filteredEntries.length === 0 && <p className={styles.emptyFilteredList}>Nenhum anime encontrado neste filtro.</p>}
      </div>
      <p className={styles.listFootnote}>Exibindo {filteredEntries.length} de {entries.length} títulos.</p>
    </section>
  );
}

function PublicationLibraryList({
  entries,
  medium,
  reviewScores,
  profileBase,
  activeFilter,
}: {
  entries: PublicationListItem[];
  medium: "MANGA" | "LIGHT_NOVEL";
  reviewScores: Map<string, number>;
  profileBase: string;
  activeFilter: LibraryFilter;
}) {
  const title = medium === "MANGA" ? "Manga list" : "Novel list";
  const description = medium === "MANGA"
    ? "Capítulos lidos, scores e status dos seus mangas."
    : "Capítulos lidos, scores e status das suas light novels.";
  const filteredEntries = entries.filter((entry) => {
    if (activeFilter === "active") return entry.status === "READING";
    if (activeFilter === "completed") return entry.status === "COMPLETED";
    if (activeFilter === "planned") return entry.status === "PLANNED";
    if (activeFilter === "paused") return entry.status === "PAUSED";
    if (activeFilter === "dropped") return entry.status === "DROPPED";
    return true;
  });

  return (
    <section className={styles.libraryPanel} aria-labelledby="publication-library-title">
      <div className={styles.libraryHeading}>
        <div><h2 id="publication-library-title">{title}</h2><p>{description}</p></div>
        <span className={styles.titleCount}>{entries.length} títulos</span>
      </div>
      <div className={styles.listToolbar}>
        <LibraryStatusFilters profileBase={profileBase} tab={medium === "MANGA" ? "manga" : "novel"} activeFilter={activeFilter} />
        <label className={styles.searchField}><FiSearch aria-hidden="true" /><span className={styles.srOnly}>Buscar nesta lista</span><input type="search" autoComplete="off" placeholder="Buscar na lista" /></label>
      </div>
      <LibraryColumnsHeader />
      <div className={styles.listItems}>
        {filteredEntries.map((entry) => {
          const cover = entry.work.coverUrl.startsWith("http") ? entry.work.coverUrl : `${API_URL}${entry.work.coverUrl}`;
          const status = publicationStatusLabels[entry.status];
          const score = reviewScores.get(entry.work.slug) ?? null;
          const mediumLabel = medium === "MANGA" ? "Manga" : "Light Novel";
          const hasKnownTotal = entry.totalChapters > 0;
          return <article className={styles.listItem} key={entry.id}>
            <Link className={styles.itemIdentity} href={entry.work.href}>
              <Image src={cover} alt={`Capa de ${entry.work.title}`} width={58} height={82} unoptimized />
              <span><strong>{entry.work.title}</strong><small>{mediumLabel} • {hasKnownTotal ? `${entry.totalChapters} capítulos` : "total em aberto"}</small><span className={styles.itemGenres}>{entry.genres.map((genre) => <em key={genre}>{genre}</em>)}</span></span>
            </Link>
            <span className={styles.itemProgress}>
              {entry.readChapters} / {hasKnownTotal ? entry.totalChapters : "-"} capítulos
            </span>
            <span className={`${styles.itemStatus} ${styles[`status${status}`]}`}>{status}</span>
            <span className={styles.itemScore}>
              {score === null ? "—" : <><span className={styles.itemScoreStar} aria-hidden="true">★</span>{score.toFixed(1)}</>}
            </span>
          </article>;
        })}
        {filteredEntries.length === 0 && <p className={styles.emptyFilteredList}>Nenhuma obra encontrada neste filtro.</p>}
      </div>
      <p className={styles.listFootnote}>Exibindo {filteredEntries.length} de {entries.length} títulos.</p>
    </section>
  );
}

function Overview({ profileBase, animeList, mangaList, novelList, favorites, reviews }: {
  profileBase: string;
  animeList: AnimeListItem[];
  mangaList: PublicationListItem[];
  novelList: PublicationListItem[];
  favorites: UserFavoriteItem[];
  reviews: UserReviewItem[];
}) {
  const watching = animeList.filter((entry) => entry.status === "WATCHING").length;
  const readingMangas = mangaList.filter((entry) => entry.status === "READING").length;
  const readingNovels = novelList.filter((entry) => entry.status === "READING").length;
  const recentActivity = [
    ...animeList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.anime.title, updatedAt: entry.updatedAt })),
    ...mangaList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.work.title, updatedAt: entry.updatedAt })),
    ...novelList.map((entry) => ({ id: `list-${entry.id}`, kind: "list" as const, title: entry.work.title, updatedAt: entry.updatedAt })),
    ...reviews.map((review) => ({ id: `review-${review.id}`, kind: "review" as const, title: review.work.title, score: review.score, updatedAt: review.updatedAt })),
  ].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()).slice(0, 4);
  const favoritesByMedium = [
    { medium: "ANIME", title: "Anime", items: favorites.filter((favorite) => favorite.work.medium === "ANIME") },
    { medium: "MANGA", title: "Manga", items: favorites.filter((favorite) => favorite.work.medium === "MANGA") },
    { medium: "LIGHT_NOVEL", title: "Light novel", items: favorites.filter((favorite) => favorite.work.medium === "LIGHT_NOVEL") },
  ] as const;
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
    <section className={`${styles.overviewPanel} ${styles.favoritesPanel}`} aria-labelledby="favorites-title">
      <div className={styles.panelHeading}>
        <div><span className={styles.kicker}>Coleção pessoal</span><h2 id="favorites-title">Favoritos</h2></div>
        <MdFavorite aria-hidden="true" />
      </div>
      {favorites.length > 0 ? (
        <div className={styles.favoriteGroups}>
          {favoritesByMedium.map((group) => <section className={styles.favoriteGroup} key={group.medium} aria-label={`Favoritos de ${group.title}`}>
            <h3>{group.title}<span>{group.items.length}</span></h3>
            {group.items.length > 0 ? <div className={styles.favoritesGrid}>
              {group.items.map((favorite) => {
                const cover = favorite.work.coverUrl.startsWith("http")
                  ? favorite.work.coverUrl
                  : `${API_URL}${favorite.work.coverUrl}`;
                return <Link href={favorite.work.href} className={styles.favoriteCard} key={favorite.id}>
                  <Image src={cover} alt={`Capa de ${favorite.work.title}`} width={75} height={110} unoptimized />
                  <span className={styles.favoriteDetails}><strong>{favorite.work.title}</strong></span>
                </Link>;
              })}
            </div> : <p className={styles.emptyFavoriteGroup}>Nenhum favorito nesta categoria.</p>}
          </section>)}
        </div>
      ) : <p className={styles.emptyFavorites}>Nenhuma obra foi adicionada aos favoritos.</p>}
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
  searchParams: Promise<{ tab?: string | string[]; status?: string | string[] }>;
}) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const cookieStore = await cookies();
  const includeAdult = cookieStore.get("otakulist-adult-content")?.value === "1";
  const refreshToken = cookieStore.get("otakulist_refresh")?.value;
  const { user, animeList, mangaList, novelList, favorites, reviews } = await getProfile(username, includeAdult, refreshToken);
  if (!user) notFound();

  const selectedTab = getSelectedTab(query.tab);
  const selectedFilter = getSelectedFilter(query.status);
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
            <div><strong>{favorites.length}</strong><span>Favoritos</span></div>
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
          {selectedTab === "overview" && (animeList.length > 0 || mangaList.length > 0 || novelList.length > 0 || favorites.length > 0 || reviews.length > 0) ? <Overview profileBase={profileBase} animeList={animeList} mangaList={mangaList} novelList={novelList} favorites={favorites} reviews={reviews} />
            : selectedTab === "anime" && animeList.length > 0 ? <AnimeLibraryList entries={animeList} reviewScores={animeReviewScores} profileBase={profileBase} activeFilter={selectedFilter} />
              : selectedTab === "manga" && mangaList.length > 0 ? <PublicationLibraryList entries={mangaList} medium="MANGA" reviewScores={mangaReviewScores} profileBase={profileBase} activeFilter={selectedFilter} />
                : selectedTab === "novel" && novelList.length > 0 ? <PublicationLibraryList entries={novelList} medium="LIGHT_NOVEL" reviewScores={novelReviewScores} profileBase={profileBase} activeFilter={selectedFilter} />
              : <section className={styles.emptyState}>{emptyIcons[selectedTab]}<h2>{emptyTitle}</h2><p>{emptyDescription}</p></section>}
        </div>
      </div>
    </main>
  );
}
