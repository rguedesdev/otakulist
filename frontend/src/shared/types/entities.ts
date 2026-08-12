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
  country: string;
  publisher?: string;
};

export type AnimeEntity = BaseWork & {
  medium: "anime";
  rating: string;
  episodes: number;
  season: string;
  studio: string;
  producers: string[];
  demography?: string;
  duration: string;
};

export type MangaEntity = BaseWork & {
  medium: "manga";
  magazine: string;
  demography: string;
  chapters: number;
  volumes: number;
  serialization: string;
};

export type LightNovelEntity = BaseWork & {
  medium: "light_novel";
  chapters: number;
  volumes: number;
  publication: string;
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

export type OrganizationEntity = BaseEntity & {
  entityType: "organization";
  organizationType: OrganizationType;
  title: string;
  foundation: string;
};

export type PublicationEntity = BaseEntity & {
  entityType: "publication";
  publicationType: PublicationType;
  title: string;
  foundation: string;
  publisher: string;
  demography: string;
  frequency: string;
};

export type EntityInfo =
  | WorkEntity
  | PersonEntity
  | CharacterEntity
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
        (["mangaka", "seiyuu", "artist"] as PersonRole[]).includes(role),
      ))
  );
}

export function getEntityTitle(entity: EntityInfo): string {
  return entity.entityType === "person" || entity.entityType === "character"
    ? entity.name_romaji
    : entity.title;
}
