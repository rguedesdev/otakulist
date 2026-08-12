import Image from "next/image";
import Link from "next/link";

import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiSearch,
  FiShare2,
  FiTv,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiBookmark3Line, RiHome5Line } from "react-icons/ri";

import styles from "./userprofile.module.css";

type ProfileTab = "overview" | "anime" | "manga" | "novel";

type LibraryItem = {
  title: string;
  image: string;
  href: string;
  meta: string;
  genres: string[];
  progress: string;
  status: "Assistindo" | "Lendo" | "Completo" | "Planejado";
  score: string;
};

const animeList: LibraryItem[] = [
  {
    title: "Gachiakuta",
    image: "/animes/gachiakuta.jpg",
    href: "/anime/gachiakuta",
    meta: "TV • 24 episódios",
    genres: ["Ação", "Fantasia", "Drama"],
    progress: "8 / 24 episódios",
    status: "Assistindo",
    score: "8.6",
  },
  {
    title: "MAO",
    image: "/animes/mao2.jpg",
    href: "/anime/mao",
    meta: "TV • 12 episódios",
    genres: ["Mistério", "Sobrenatural"],
    progress: "5 / 12 episódios",
    status: "Assistindo",
    score: "8.2",
  },
  {
    title: "InuYasha",
    image: "/animes/inuyasha2.png",
    href: "/anime/inuyasha",
    meta: "TV • 167 episódios",
    genres: ["Aventura", "Romance", "Fantasia"],
    progress: "167 / 167 episódios",
    status: "Completo",
    score: "8.4",
  },
  {
    title: "Wolf's Rain",
    image: "/animes/wolfs.jpg",
    href: "/anime/wolfs-rain",
    meta: "TV • 26 episódios",
    genres: ["Drama", "Fantasia", "Sci-fi"],
    progress: "0 / 26 episódios",
    status: "Planejado",
    score: "—",
  },
];

const mangaList: LibraryItem[] = [
  {
    title: "Dandadan",
    image: "/mangas/dandadan.jpg",
    href: "/manga/dandadan",
    meta: "Manga • Em publicação",
    genres: ["Ação", "Comédia", "Sobrenatural"],
    progress: "86 capítulos • 10 volumes",
    status: "Lendo",
    score: "8.3",
  },
  {
    title: "MAO",
    image: "/mangas/mao.jpg",
    href: "/manga/mao",
    meta: "Manga • Em publicação",
    genres: ["Mistério", "Romance", "Sobrenatural"],
    progress: "61 capítulos • 7 volumes",
    status: "Lendo",
    score: "8.1",
  },
  {
    title: "Ranma ½",
    image: "/mangas/ranma.jpg",
    href: "/manga/ranma",
    meta: "Manga • 38 volumes",
    genres: ["Comédia", "Romance", "Artes marciais"],
    progress: "407 capítulos • 38 volumes",
    status: "Completo",
    score: "8.7",
  },
  {
    title: "Centuria",
    image: "/mangas/centuria.jpg",
    href: "/manga/centuria",
    meta: "Manga • Em publicação",
    genres: ["Ação", "Fantasia sombria"],
    progress: "0 capítulos • 0 volumes",
    status: "Planejado",
    score: "—",
  },
];

const novelList: LibraryItem[] = [
  {
    title: "Make Heroine ga Oosugiru!",
    image: "/light-novels/make-heroine.jpg",
    href: "/light-novel/make-heroine-ga-oosugiru",
    meta: "Light novel • Em publicação",
    genres: ["Comédia", "Romance", "Vida escolar"],
    progress: "4 capítulos • 2 volumes",
    status: "Lendo",
    score: "8.5",
  },
];

const tabContent = {
  anime: {
    title: "Anime list",
    description: "Episódios assistidos, scores e status dos seus animes.",
    total: 128,
    items: animeList,
  },
  manga: {
    title: "Manga list",
    description: "Capítulos e volumes dos mangas que fazem parte da sua biblioteca.",
    total: 46,
    items: mangaList,
  },
  novel: {
    title: "Novel list",
    description: "Uma biblioteca própria para light novels, sem misturá-las com mangas.",
    total: 19,
    items: novelList,
  },
};

const validTabs = new Set<ProfileTab>(["overview", "anime", "manga", "novel"]);

function getSelectedTab(value: string | string[] | undefined): ProfileTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab && validTabs.has(tab as ProfileTab) ? (tab as ProfileTab) : "overview";
}

function LibraryList({ tab }: { tab: Exclude<ProfileTab, "overview"> }) {
  const content = tabContent[tab];

  return (
    <section className={styles.libraryPanel} aria-labelledby="library-title">
      <div className={styles.libraryHeading}>
        <div>
          <h2 id="library-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <span className={styles.titleCount}>{content.total} títulos</span>
      </div>

      <div className={styles.listToolbar}>
        <div className={styles.statusFilters} aria-label="Filtrar por status">
          <button className={styles.filterActive} type="button">Todos</button>
          <button type="button">Em andamento</button>
          <button type="button">Completos</button>
          <button type="button">Planejados</button>
        </div>
        <label className={styles.searchField}>
          <FiSearch aria-hidden="true" />
          <span className={styles.srOnly}>Buscar nesta lista</span>
          <input type="search" placeholder="Buscar na lista" />
        </label>
      </div>

      <div className={styles.listHeader} aria-hidden="true">
        <span>Título</span>
        <span>Progresso</span>
        <span>Status</span>
        <span>Score</span>
      </div>

      <div className={styles.listItems}>
        {content.items.map((item) => (
          <article className={styles.listItem} key={item.title}>
            <Link className={styles.itemIdentity} href={item.href}>
              <Image src={item.image} alt={`Capa de ${item.title}`} width={58} height={82} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
                <span className={styles.itemGenres}>
                  {item.genres.map((genre) => <em key={genre}>{genre}</em>)}
                </span>
              </span>
            </Link>
            <span className={styles.itemProgress}>{item.progress}</span>
            <span className={`${styles.itemStatus} ${styles[`status${item.status}`]}`}>
              {item.status}
            </span>
            <span className={styles.itemScore}>{item.score === "—" ? item.score : `★ ${item.score}`}</span>
          </article>
        ))}
      </div>

      <p className={styles.listFootnote}>
        Exibindo {content.items.length} de {content.total} títulos nesta proposta estática.
      </p>
    </section>
  );
}

function Overview({ profileBase }: { profileBase: string }) {
  return (
    <div className={styles.overviewGrid}>
      <section className={styles.overviewPanel} aria-labelledby="library-overview-title">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.kicker}>Sua jornada</span>
            <h2 id="library-overview-title">Resumo da biblioteca</h2>
          </div>
          <FiClock aria-hidden="true" />
        </div>

        <div className={styles.librarySummaries}>
          <Link href={`${profileBase}?tab=anime`}>
            <span className={styles.summaryIcon}><FiTv aria-hidden="true" /></span>
            <span className={styles.summaryCopy}>
              <strong>Anime list</strong>
              <small>18 assistindo agora</small>
            </span>
            <span className={styles.summaryValue}>128</span>
          </Link>
          <Link href={`${profileBase}?tab=manga`}>
            <span className={styles.summaryIcon}><GiEvilBook aria-hidden="true" /></span>
            <span className={styles.summaryCopy}>
              <strong>Manga list</strong>
              <small>9 leituras em andamento</small>
            </span>
            <span className={styles.summaryValue}>46</span>
          </Link>
          <Link href={`${profileBase}?tab=novel`}>
            <span className={styles.summaryIcon}><LuBookHeart aria-hidden="true" /></span>
            <span className={styles.summaryCopy}>
              <strong>Novel list</strong>
              <small>4 leituras em andamento</small>
            </span>
            <span className={styles.summaryValue}>19</span>
          </Link>
        </div>
      </section>

      <section className={styles.overviewPanel} aria-labelledby="activity-title">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.kicker}>Últimos registros</span>
            <h2 id="activity-title">Atividade recente</h2>
          </div>
          <RiBookmark3Line aria-hidden="true" />
        </div>

        <div className={styles.activityList}>
          <div>
            <span className={styles.activityMarker} />
            <p>Assistiu ao episódio 8 de <strong>Gachiakuta</strong></p>
            <time>há 2 horas</time>
          </div>
          <div>
            <span className={styles.activityMarker} />
            <p>Atualizou <strong>Dandadan</strong> para o capítulo 86</p>
            <time>ontem</time>
          </div>
          <div>
            <span className={styles.activityMarker} />
            <p>Avaliou <strong>InuYasha</strong> com score 8.4</p>
            <time>há 3 dias</time>
          </div>
          <div>
            <span className={styles.activityMarker} />
            <p>Adicionou <strong>Make Heroine ga Oosugiru!</strong></p>
            <time>há 5 dias</time>
          </div>
        </div>
      </section>

      <section className={`${styles.overviewPanel} ${styles.friendsPanel}`} aria-labelledby="friends-title">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.kicker}>Conexões</span>
            <h2 id="friends-title">Amigos</h2>
          </div>
          <FiUsers aria-hidden="true" />
        </div>

        <div className={styles.friendsSummary}>
          <div className={styles.friendAvatars} aria-hidden="true">
            <Image src="/kitou.jpg" alt="" width={42} height={42} />
            <Image src="/rumiko.png" alt="" width={42} height={42} />
            <Image src="/yuuichirou.jpg" alt="" width={42} height={42} />
            <Image src="/yamaguchi.png" alt="" width={42} height={42} />
          </div>
          <div className={styles.friendsCopy}>
            <strong>38 amigos</strong>
            <span>4 amigos em comum com você</span>
          </div>
          <button className={styles.friendsAction} type="button">
            Ver amizades
          </button>
        </div>
      </section>
    </div>
  );
}

async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const selectedTab = getSelectedTab(query.tab);
  const profileBase = `/user/${encodeURIComponent(username)}`;

  const tabs: Array<{ id: ProfileTab; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Visão geral", icon: <RiHome5Line aria-hidden="true" /> },
    { id: "anime", label: "Anime list", icon: <FiTv aria-hidden="true" /> },
    { id: "manga", label: "Manga list", icon: <GiEvilBook aria-hidden="true" /> },
    { id: "novel", label: "Novel list", icon: <LuBookHeart aria-hidden="true" /> },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.profileContainer}>
        <section className={styles.profileHero} aria-labelledby="profile-name">
          <div className={styles.coverPattern} aria-hidden="true" />
          <div className={styles.profileMain}>
            <Image
              className={styles.avatar}
              src="/kon.jpg"
              alt={`Avatar de ${username}`}
              width={132}
              height={132}
              priority
            />
            <div className={styles.profileIdentity}>
              <h1 id="profile-name">Kon</h1>
              <p className={styles.username}>@{username}</p>
              <p className={styles.bio}>
                Colecionando histórias, temporadas e boas recomendações. Fã de fantasia,
                mistério e obras que ficam na cabeça por muito tempo.
              </p>
              <div className={styles.profileMeta}>
                <span><FiMapPin aria-hidden="true" />São Paulo, Brasil</span>
                <span><FiCalendar aria-hidden="true" />Membro desde 2024</span>
              </div>
            </div>
            <div className={styles.profileActions}>
              <button className={styles.friendButton} type="button">
                <FiUserPlus aria-hidden="true" />
                Adicionar amigo
              </button>
              <button className={styles.shareButton} type="button" aria-label="Compartilhar perfil" title="Compartilhar perfil">
                <FiShare2 aria-hidden="true" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>

          <div className={styles.profileStats}>
            <div><strong>128</strong><span>Animes</span></div>
            <div><strong>46</strong><span>Mangas</span></div>
            <div><strong>19</strong><span>Novels</span></div>
            <div><strong>38</strong><span>Amigos</span></div>
            <div><strong>124</strong><span>Dias assistidos</span></div>
            <div><strong>2.148</strong><span>Episódios</span></div>
          </div>
        </section>

        <nav className={styles.profileNav} aria-label="Conteúdo do perfil">
          {tabs.map((tab) => (
            <Link
              className={selectedTab === tab.id ? styles.profileNavActive : undefined}
              href={tab.id === "overview" ? profileBase : `${profileBase}?tab=${tab.id}`}
              aria-current={selectedTab === tab.id ? "page" : undefined}
              key={tab.id}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className={styles.profileContent}>
          {selectedTab === "overview" ? (
            <Overview profileBase={profileBase} />
          ) : (
            <LibraryList tab={selectedTab} />
          )}
        </div>
      </div>
    </main>
  );
}

export default UserProfilePage;
