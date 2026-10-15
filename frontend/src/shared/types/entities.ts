export type EntityType =
  | "work"
  | "person"
  | "organization"
  | "publication"
  | "character";

export type WorkMedium = "anime" | "manga" | "light_novel";

export type AnimeReleaseFormat =
  | "tv"
  | "movie"
  | "ova"
  | "ona"
  | "special";

export type PersonRole = "seiyuu" | "artist" | "mangaka" | "staff";
export type OrganizationType = "publisher" | "studio";
export type PublicationType = "magazine";

type BaseEntity = {
  cover: string;
  description: string;
  externalLinks?: {
    website?: string;
    x?: string;
    instagram?: string;
    pixiv?: string;
    youtube?: string;
    tiktok?: string;
  };
};

type BaseWork = BaseEntity & {
  entityType: "work";
  title: string;
  score: number;
  status: string;
  start: string;
  end: string;
  source?: string;
  genders: string[];
  publisher?: string;
  publisherLink?: { displayName: string; slug: string };
  alternativeTitles?: Array<{
    type: "JAPANESE" | "ROMAJI" | "ENGLISH" | "PORTUGUESE" | "LITERAL" | "SYNONYM" | "OTHER";
    title: string;
  }>;
  storeLinks?: {
    amazon?: string; cdJapan?: string; mercadoLivre?: string; rakuten?: string; shopee?: string;
    ebay?: string; otakuyasan?: string; hmv?: string; honto?: string; toranoana?: string; animate?: string;
  };
};

export type AnimeEntity = BaseWork & {
  medium: "anime";
  rating: string;
  episodes: number;
  season?: string;
  studio: string;
  studioLinks?: Array<{ displayName: string; slug?: string }>;
  producers: string[];
  demography?: string;
  duration: string;
  streamingLinks?: {
    crunchyroll?: string;
    netflix?: string;
    primeVideo?: string;
    bilibili?: string;
    retrocrush?: string;
    hulu?: string;
    hidive?: string;
    uNext?: string;
    abemaTv?: string;
    adn?: string;
    museAsia?: string;
    laftel?: string;
    tver?: string;
    iqiyi?: string;
    tubi?: string;
    dAnimeStore?: string;
  };
};

export type MangaEntity = BaseWork & {
  medium: "manga";
  magazine: string;
  magazineLink?: { title: string; slug: string };
  demography: string;
  chapters: number;
  volumes: number;
  publicationPeriod: string;
};

export type LightNovelEntity = BaseWork & {
  medium: "light_novel";
  chapters: number;
  volumes: number;
  publicationPeriod: string;
};

export type WorkEntity = AnimeEntity | MangaEntity | LightNovelEntity;

export type PersonEntity = BaseEntity & {
  entityType: "person";
  roles: PersonRole[];
  name_romaji: string;
  name_kanji: string;
  hometown: string;
  date_of_birth: string;
  agency?: string;
  activity_period?: string;
  occupations?: string[];
  record_label?: string;
  musical_genres?: string[];
};

export type CharacterEntity = BaseEntity & {
  entityType: "character";
  name_romaji: string;
  name_kanji: string;
  hometown: string;
  date_of_birth: string;
};

export type MusicArtistEntity = BaseEntity & {
  entityType: "music_artist";
  title: string;
  artist_kind: "solo" | "band";
  name_kanji?: string;
  origin?: string;
  date_of_birth?: string;
  date_of_creation?: string;
  activity_period?: string;
  record_label?: string;
  musical_genres?: string[];
};

export type OrganizationEntity = BaseEntity & {
  entityType: "organization";
  organizationType: OrganizationType;
  title: string;
  foundation: string;
  name_kanji?: string;
  headquarters?: string;
};

export type PublicationEntity = BaseEntity & {
  entityType: "publication";
  publicationType: PublicationType;
  title: string;
  foundation: string;
  publisher: string;
  publisherLink?: { displayName: string; slug: string };
  demography: string;
  frequency: string;
  storeLinks?: BaseWork["storeLinks"];
};

export type EntityInfo =
  | WorkEntity
  | PersonEntity
  | CharacterEntity
  | MusicArtistEntity
  | OrganizationEntity
  | PublicationEntity;

export const mediumLabels: Record<WorkMedium, string> = {
  anime: "Anime",
  manga: "Manga",
  light_novel: "Light Novel",
};

export const animeReleaseFormatLabels: Record<AnimeReleaseFormat, string> = {
  tv: "TV",
  movie: "Filme",
  ova: "OVA",
  ona: "ONA",
  special: "Especial",
};

export function getUniqueAnimeReleaseFormats(
  formats: readonly AnimeReleaseFormat[],
): AnimeReleaseFormat[] {
  return [...new Set(formats)];
}

export function formatAnimeReleaseFormats(
  formats: readonly AnimeReleaseFormat[],
): string {
  return getUniqueAnimeReleaseFormats(formats)
    .map((format) => animeReleaseFormatLabels[format])
    .join(" • ");
}

export function isWork(entity: EntityInfo): entity is WorkEntity {
  return entity.entityType === "work";
}

export function isAnime(entity: EntityInfo): entity is AnimeEntity {
  return isWork(entity) && entity.medium === "anime";
}

export function isPerson(entity: EntityInfo): entity is PersonEntity {
  return entity.entityType === "person";
}

export function hasPersonRole(entity: EntityInfo, role: PersonRole): boolean {
  return isPerson(entity) && entity.roles.includes(role);
}

export function hasVisiblePersonalDetails(
  entity: EntityInfo,
): entity is PersonEntity | CharacterEntity {
  return (
    entity.entityType === "character" ||
    (isPerson(entity) &&
      entity.roles.some((role) =>
        (["mangaka", "seiyuu", "artist", "staff"] as PersonRole[]).includes(role),
      ))
  );
}

export function getEntityTitle(entity: EntityInfo): string {
  return entity.entityType === "person" || entity.entityType === "character"
    ? entity.name_romaji
    : entity.title;
}
