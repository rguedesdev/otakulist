import bcrypt from "bcrypt";
import { GraphQLError } from "graphql";
import type { IResolvers, MercuriusContext } from "mercurius";

import { env } from "../config/env.js";
import { Anime } from "../models/anime.js";
import { AnimeEditSuggestion } from "../models/anime-edit-suggestion.js";
import { AnimeListEntry } from "../models/anime-list-entry.js";
import { CatalogWork } from "../models/catalog-work.js";
import { PublicationListEntry } from "../models/publication-list-entry.js";
import { Character } from "../models/character.js";
import { Manga } from "../models/manga.js";
import { LightNovel } from "../models/light-novel.js";
import { Magazine } from "../models/magazine.js";
import { MusicArtist } from "../models/music-artist.js";
import { Person } from "../models/person.js";
import { Publisher } from "../models/publisher.js";
import { Studio } from "../models/studio.js";
import { Session } from "../models/session.js";
import { User } from "../models/user.js";
import { WorkFavorite } from "../models/work-favorite.js";
import { WorkReview } from "../models/work-review.js";
import { animeSlugSchema, createAnimeSchema, updateAnimeSchema } from "../services/anime/schemas.js";
import {
  getAnimeSeasonDateRanges,
  getBroadcastSeasonPattern,
  installmentMatchesSeason,
  type AnimeSeason,
} from "../services/anime/season.js";
import {
  getAnimeStatusOverride,
  getEffectiveAnimeStatus,
  getOverallAnimeStatus,
  type AnimeStatus,
} from "../services/anime/status.js";
import { removeAnimeListEntrySchema, saveAnimeListEntrySchema } from "../services/anime-list/schemas.js";
import { pickDailyItem } from "../services/weekly-feature.js";
import { getPublicationListEntrySchema, removePublicationListEntrySchema, savePublicationListEntrySchema } from "../services/publication-list/schemas.js";
import { saveWorkReviewSchema, workReviewTargetSchema } from "../services/review/schemas.js";
import { createLightNovelSchema, createMangaSchema, updateLightNovelSchema, updateMangaSchema } from "../services/publication-work/schemas.js";
import { createMagazineSchema, magazineSlugSchema, updateMagazineSchema } from "../services/magazine/schemas.js";
import { animeSlugFromTitle } from "../services/anime/slug.js";
import { loginSchema, registerSchema, updateProfileSchema, usernameSchema } from "../services/auth/schemas.js";
import {
  characterSlugSchema,
  createCharacterSchema,
  updateCharacterSchema,
} from "../services/character/schemas.js";
import { createSeiyuuSchema, seiyuuSlugSchema, updateSeiyuuSchema } from "../services/seiyuu/schemas.js";
import { createStudioSchema, studioSlugSchema, updateStudioSchema } from "../services/studio/schemas.js";
import { createPublisherSchema, publisherSlugSchema, updatePublisherSchema } from "../services/publisher/schemas.js";
import {
  createIndustryPersonSchema,
  industryPersonSlugSchema,
  updateIndustryPersonSchema,
} from "../services/industry-person/schemas.js";
import {
  createMusicArtistSchema,
  musicArtistSlugSchema,
  updateMusicArtistSchema,
} from "../services/music-artist/schemas.js";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  createAccessToken,
  createSessionTokens,
  hashToken,
  setRefreshCookie,
  verifyRefreshToken,
  type AccessTokenPayload,
} from "../services/auth/tokens.js";

type GraphQLContext = MercuriusContext;

export const schema = /* GraphQL */ `
  enum UserRole {
    FREE
    VIP
    ZEUS
  }

  enum AnimePublicationStatus { DRAFT PUBLISHED }
  enum AnimeReleaseFormat { TV MOVIE OVA ONA SPECIAL }
  enum AnimeStatus { ANNOUNCED AIRING FINISHED CANCELLED }
  enum AnimeSeason { WINTER SPRING SUMMER FALL }
  enum AnimeBroadcastDay { SUNDAY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY }
  enum AnimeSongType { OPENING ENDING INSERT }
  enum MusicArtistKind { SOLO BAND }
  enum AlternativeTitleType { JAPANESE ROMAJI ENGLISH PORTUGUESE LITERAL OTHER }
  enum RelatedWorkType { ADAPTATION ALTERNATIVE_VERSION CHARACTER OTHER PARENT_STORY SIDE_STORY SOURCE_MATERIAL SPIN_OFF }
  enum WorkMedium { ANIME MANGA LIGHT_NOVEL }
  enum AnimeListStatus { PLANNED WATCHING PAUSED COMPLETED DROPPED }
  enum PublicationListStatus { PLANNED READING PAUSED COMPLETED DROPPED }

  type WorkReview { score: Float! comment: String updatedAt: String! }
  type PublicWorkReview { id: ID! score: Float! comment: String! updatedAt: String! author: PublicUser! }
  type ReviewSummary { average: Float! count: Int! }
  type UserFavorite {
    id: ID!
    createdAt: String!
    work: WorkSearchResult!
  }
  type TopRatedWork {
    title: String!
    slug: String!
    medium: WorkMedium!
    coverUrl: String!
    score: Float!
    ratingCount: Int!
  }
  type DiscoveryWork {
    title: String!
    slug: String!
    medium: WorkMedium!
    coverUrl: String!
    description: String!
  }
  input SaveWorkReviewInput { score: Float! comment: String }

  type User {
    id: ID!
    username: String!
    displayName: String!
    bio: String
    email: String!
    role: UserRole!
    avatarUrl: String
    showAdultContent: Boolean!
    hideAdultContentFromVisitors: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterInput {
    username: String!
    displayName: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    username: String!
    displayName: String!
    bio: String
    email: String!
    showAdultContent: Boolean!
    hideAdultContentFromVisitors: Boolean!
  }

  type AuthPayload {
    accessToken: String!
    user: User!
  }

  type PublicUser {
    id: ID!
    username: String!
    displayName: String!
    bio: String
    role: UserRole!
    avatarUrl: String
    createdAt: String!
  }

  type AlternativeTitle { type: AlternativeTitleType! title: String! }

  type AnimeInstallment {
    id: ID!
    order: Int!
    title: String!
    label: String!
    format: AnimeReleaseFormat!
    synopsis: String!
    coverUrl: String
    episodes: Int!
    durationMinutes: Int
    status: AnimeStatus!
    statusOverride: AnimeStatus
    startDate: String
    endDate: String
    broadcastSeason: String
    broadcastDay: AnimeBroadcastDay
    broadcastTime: String
    studio: Studio
    studioName: String
  }

  type IndustryPerson {
    id: ID!
    displayName: String!
    slug: String!
    nameKanji: String
    imageUrl: String
    description: String
    roles: [String!]!
    dateOfBirth: String
    hometown: String
    agency: String
    activityPeriod: String
    occupations: [String!]!
    externalLinks: ExternalLinks!
    animeCredits: [PersonAnimeCredit!]!
    mangaCredits: [PersonMangaCredit!]!
    publicationStatus: AnimePublicationStatus!
    createdAt: String!
    updatedAt: String!
  }

  type StudioAnime { id: ID! title: String! slug: String! coverUrl: String! startDate: String endDate: String broadcastSeason: String }
  type StudioAnimeCredit { anime: StudioAnime! }
  type Studio {
    id: ID!
    displayName: String!
    slug: String!
    nameKanji: String
    imageUrl: String!
    description: String
    foundation: String
    headquarters: String
    website: String
    externalLinks: ExternalLinks!
    publicationStatus: AnimePublicationStatus!
    animeCredits: [StudioAnimeCredit!]!
    createdAt: String!
    updatedAt: String!
  }

  type Publisher {
    id: ID!
    displayName: String!
    slug: String!
    imageUrl: String!
    description: String
    foundation: String
    headquarters: String
    externalLinks: ExternalLinks!
    publicationStatus: AnimePublicationStatus!
    magazines: [Magazine!]!
    lightNovels: [LightNovel!]!
    createdAt: String!
    updatedAt: String!
  }

  type Magazine {
    id: ID!
    title: String!
    slug: String!
    description: String!
    imageUrl: String!
    foundation: String
    publisher: Publisher!
    demography: String
    frequency: String
    externalLinks: ExternalLinks!
    storeLinks: StoreLinks!
    publicationStatus: AnimePublicationStatus!
    mangas: [Manga!]!
    createdAt: String!
    updatedAt: String!
  }

  type PersonAnimeCredit { anime: PersonAnime! role: String! contribution: String }
  type PersonAnime { id: ID! title: String! slug: String! coverUrl: String! startDate: String endDate: String }
  type PersonMangaCredit { manga: PersonManga! role: String! contribution: String }
  type PersonManga { id: ID! title: String! slug: String! coverUrl: String! startDate: String endDate: String }

  type AnimeStaffCredit {
    personId: ID!
    role: String!
    contribution: String
    person: IndustryPerson!
  }

  type AnimeCharacterCredit {
    characterId: ID!
    seiyuuId: ID!
    character: Character!
    seiyuu: IndustryPerson!
  }
  type AnimeSongCredit {
    artistId: ID!
    songTitle: String!
    featuredArtists: [MusicArtist!]!
    type: AnimeSongType!
    sequence: Int
    episodeRange: String
    artist: MusicArtist!
  }

  type RelatedWork {
    id: ID!
    relationType: RelatedWorkType!
    title: String!
    slug: String!
    href: String!
    coverUrl: String!
    medium: String!
    status: String!
  }

  type WorkSearchResult { id: ID! title: String! slug: String! medium: WorkMedium! coverUrl: String! status: String! href: String! }
  type UserWorkReview { id: ID! score: Float! updatedAt: String! work: WorkSearchResult! }

  type ExternalLinks { website: String x: String instagram: String pixiv: String youtube: String }
  type StreamingLinks {
    crunchyroll: String netflix: String primeVideo: String bilibili: String retrocrush: String
    hulu: String hidive: String uNext: String abemaTv: String adn: String museAsia: String
    laftel: String tver: String iqiyi: String tubi: String dAnimeStore: String
  }
  type MusicPlatformLinks { spotify: String tidal: String deezer: String amazonMusic: String }
  type MusicArtistDiscographyRelease {
    title: String!
    releaseType: String!
    year: String!
    tracks: Int!
    cover: String!
  }
  type MusicArtistAnime {
    id: ID!
    title: String!
    slug: String!
    coverUrl: String!
  }
  type MusicArtistAnimeSong {
    anime: MusicArtistAnime!
    songTitle: String!
    featuredArtists: [MusicArtist!]!
    type: AnimeSongType!
    sequence: Int
    episodeRange: String
  }
  type MusicArtist {
    id: ID!
    displayName: String!
    slug: String!
    kind: MusicArtistKind!
    nameKanji: String
    imageUrl: String!
    description: String
    origin: String
    dateOfBirth: String
    activityPeriod: String
    recordLabel: String
    genres: [String!]!
    discography: [MusicArtistDiscographyRelease!]!
    platformLinks: MusicPlatformLinks!
    publicationStatus: AnimePublicationStatus!
    animeSongs: [MusicArtistAnimeSong!]!
    createdAt: String!
    updatedAt: String!
  }

  type CharacterVoiceCredit {
    seiyuuSlug: String!
    animeTitle: String!
  }
  type CharacterAppearance {
    id: ID!
    title: String!
    slug: String!
    coverUrl: String!
    medium: WorkMedium!
    formats: [String!]!
  }
  type Character {
    id: ID!
    nameRomaji: String!
    slug: String!
    nameKanji: String
    description: String
    imageUrl: String!
    dateOfBirth: String
    hometown: String
    publicationStatus: AnimePublicationStatus!
    voiceCredits: [CharacterVoiceCredit!]!
    appearances: [CharacterAppearance!]!
    createdAt: String!
    updatedAt: String!
  }
  input CharacterVoiceCreditInput {
    seiyuuSlug: String!
    animeTitle: String!
  }
  input CreateCharacterInput {
    nameRomaji: String!
    nameKanji: String
    description: String
    imageUrl: String!
    dateOfBirth: String
    hometown: String
    publicationStatus: AnimePublicationStatus! = DRAFT
    voiceCredits: [CharacterVoiceCreditInput!] = []
  }
  input CreateSeiyuuInput {
    displayName: String!
    nameKanji: String
    imageUrl: String!
    description: String
    dateOfBirth: String
    hometown: String
    agency: String
    externalLinks: ExternalLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }
  input CreateIndustryPersonInput {
    displayName: String!
    nameKanji: String
    imageUrl: String!
    description: String
    dateOfBirth: String
    hometown: String
    activityPeriod: String
    occupations: [String!] = []
    externalLinks: ExternalLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }

  enum WorkEditSuggestionStatus { PENDING APPROVED REJECTED }
  type WorkEditSuggestion {
    id: ID!
    medium: WorkMedium!
    anime: Anime
    manga: Manga
    lightNovel: LightNovel
    proposer: PublicUser!
    title: String
    synopsis: String
    genres: [String!]
    status: WorkEditSuggestionStatus!
    createdAt: String!
  }
  input WorkEditSuggestionInput { title: String synopsis: String genres: [String!] }
  type Anime {
    id: ID!
    title: String!
    slug: String!
    synopsis: String!
    coverUrl: String!
    alternativeTitles: [AlternativeTitle!]!
    genres: [String!]!
    producers: [String!]!
    demography: String
    rating: String
    adultContent: Boolean!
    publicationStatus: AnimePublicationStatus!
    installments: [AnimeInstallment!]!
    characterCredits: [AnimeCharacterCredit!]!
    songCredits: [AnimeSongCredit!]!
    staffCredits: [AnimeStaffCredit!]!
    relatedWorks: [RelatedWork!]!
    externalLinks: ExternalLinks!
    streamingLinks: StreamingLinks!
    createdAt: String!
    updatedAt: String!
    reviewSummary: ReviewSummary!
  }

  type SeasonalAnime {
    anime: Anime!
    installment: AnimeInstallment!
  }

  type AnimeSeasonProgress { order: Int! watchedEpisodes: Int! }
  type AnimeListEntry {
    id: ID!
    status: AnimeListStatus!
    score: Int
    seasonProgress: [AnimeSeasonProgress!]!
    anime: Anime!
    createdAt: String!
    updatedAt: String!
  }
  type PublicationListEntry {
    id: ID!
    status: PublicationListStatus!
    readChapters: Int!
    work: WorkSearchResult!
    totalChapters: Int!
    genres: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  input AlternativeTitleInput { type: AlternativeTitleType! title: String! }
  input AnimeInstallmentInput {
    order: Int!
    title: String!
    label: String!
    format: AnimeReleaseFormat!
    synopsis: String!
    coverUrl: String
    episodes: Int!
    durationMinutes: Int
    status: AnimeStatus!
    statusOverride: AnimeStatus
    startDate: String
    endDate: String
    broadcastSeason: String
    broadcastDay: AnimeBroadcastDay
    broadcastTime: String
    studioId: ID
    studioName: String
  }
  input AnimeStaffCreditInput { personId: ID! role: String! contribution: String }
  input AnimeCharacterCreditInput { characterId: ID! seiyuuId: ID! }
  input AnimeSongCreditInput {
    artistId: ID!
    songTitle: String!
    featuredArtistIds: [ID!] = []
    type: AnimeSongType!
    sequence: Int
    episodeRange: String
  }
  input MusicPlatformLinksInput { spotify: String tidal: String deezer: String amazonMusic: String }
  input MusicArtistDiscographyReleaseInput {
    title: String!
    releaseType: String!
    year: String!
    tracks: Int!
    cover: String!
  }
  input CreateMusicArtistInput {
    displayName: String!
    kind: MusicArtistKind!
    nameKanji: String
    imageUrl: String!
    description: String
    origin: String
    dateOfBirth: String
    activityPeriod: String
    recordLabel: String
    genres: [String!] = []
    discography: [MusicArtistDiscographyReleaseInput!] = []
    platformLinks: MusicPlatformLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }
  input RelatedWorkInput {
    relationType: RelatedWorkType!
    workId: ID!
  }
  input ExternalLinksInput { website: String x: String instagram: String pixiv: String youtube: String }
  input StreamingLinksInput {
    crunchyroll: String netflix: String primeVideo: String bilibili: String retrocrush: String
    hulu: String hidive: String uNext: String abemaTv: String adn: String museAsia: String
    laftel: String tver: String iqiyi: String tubi: String dAnimeStore: String
  }
  input CreateAnimeInput {
    title: String!
    synopsis: String!
    coverUrl: String!
    alternativeTitles: [AlternativeTitleInput!] = []
    genres: [String!] = []
    producers: [String!] = []
    demography: String
    rating: String
    adultContent: Boolean! = false
    publicationStatus: AnimePublicationStatus! = DRAFT
    installments: [AnimeInstallmentInput!]!
    characterCredits: [AnimeCharacterCreditInput!] = []
    songCredits: [AnimeSongCreditInput!] = []
    staffCredits: [AnimeStaffCreditInput!] = []
    relatedWorks: [RelatedWorkInput!] = []
    externalLinks: ExternalLinksInput
    streamingLinks: StreamingLinksInput
  }
  input AnimeSeasonProgressInput { order: Int! watchedEpisodes: Int! }
  input SaveAnimeListEntryInput {
    status: AnimeListStatus!
    score: Int
    seasonProgress: [AnimeSeasonProgressInput!]!
  }
  input SavePublicationListEntryInput {
    status: PublicationListStatus!
    readChapters: Int!
  }

  type Query {
    me: User
    user(username: String!): PublicUser
    anime(slug: String!, includeAdult: Boolean = false): Anime
    dailyFeaturedAnime(includeAdult: Boolean = false): Anime
    seasonalAnime(season: AnimeSeason!, year: Int!, limit: Int, includeAdult: Boolean = false, deduplicate: Boolean = true): [SeasonalAnime!]!
    manga(slug: String!, includeAdult: Boolean = false): Manga
    dailyMangaRecommendation(includeAdult: Boolean = false): Manga
    recentPublishingMangas(limit: Int = 5, includeAdult: Boolean = false): [Manga!]!
    browseMangas(includeAdult: Boolean = false): [Manga!]!
    lightNovel(slug: String!, includeAdult: Boolean = false): LightNovel
    publishingLightNovelSpotlight(includeAdult: Boolean = false): LightNovel
    dailyLightNovelRecommendation(includeAdult: Boolean = false): LightNovel
    recentPublishingLightNovels(limit: Int = 5, includeAdult: Boolean = false): [LightNovel!]!
    browseLightNovels(includeAdult: Boolean = false): [LightNovel!]!
    character(slug: String!): Character
    seiyuu(slug: String!): IndustryPerson
    staff(slug: String!): IndustryPerson
    mangaka(slug: String!): IndustryPerson
    musicArtist(slug: String!): MusicArtist
    studio(slug: String!): Studio
    publisher(slug: String!): Publisher
    magazine(slug: String!): Magazine
    charactersBySeiyuu(slug: String!): [Character!]!
    searchWorks(query: String!, medium: WorkMedium, includeAdult: Boolean = false): [WorkSearchResult!]!
    topRatedWorks(medium: WorkMedium, limit: Int = 5, includeAdult: Boolean = false): [TopRatedWork!]!
    discoveryWorks(includeAdult: Boolean = false): [DiscoveryWork!]!
    searchPeople(query: String!): [IndustryPerson!]!
    searchStudios(query: String!): [Studio!]!
    searchPublishers(query: String!): [Publisher!]!
    searchMagazines(query: String!): [Magazine!]!
    adminAnimes(query: String): [Anime!]!
    pendingWorkEditSuggestions: [WorkEditSuggestion!]!
    adminMangas(query: String): [Manga!]!
    adminLightNovels(query: String): [LightNovel!]!
    adminCharacters(query: String): [Character!]!
    adminSeiyuus(query: String): [IndustryPerson!]!
    adminStaff(query: String): [IndustryPerson!]!
    adminMangakas(query: String): [IndustryPerson!]!
    adminMusicArtists(query: String): [MusicArtist!]!
    adminStudios(query: String): [Studio!]!
    adminPublishers(query: String): [Publisher!]!
    adminMagazines(query: String): [Magazine!]!
    myAnimeListEntry(animeSlug: String!): AnimeListEntry
    myPublicationListEntry(medium: WorkMedium!, slug: String!): PublicationListEntry
    animeList(username: String!, includeAdult: Boolean = false): [AnimeListEntry!]!
    publicationList(username: String!, medium: WorkMedium!, includeAdult: Boolean = false): [PublicationListEntry!]!
    userFavorites(username: String!, includeAdult: Boolean = false): [UserFavorite!]!
    myWorkFavorite(medium: WorkMedium!, slug: String!): Boolean!
    userReviews(username: String!, includeAdult: Boolean = false): [UserWorkReview!]!
    workReviewComments(medium: WorkMedium!, slug: String!): [PublicWorkReview!]!
    myWorkReview(medium: WorkMedium!, slug: String!): WorkReview
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshSession: AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): AuthPayload!
    createAnime(input: CreateAnimeInput!): Anime!
    updateAnime(slug: String!, input: CreateAnimeInput!): Anime!
    suggestWorkEdit(medium: WorkMedium!, slug: String!, input: WorkEditSuggestionInput!): WorkEditSuggestion!
    reviewWorkEditSuggestion(id: ID!, approve: Boolean!): WorkEditSuggestion!
    createManga(input: CreateMangaInput!): Manga!
    updateManga(slug: String!, input: CreateMangaInput!): Manga!
    createLightNovel(input: CreateLightNovelInput!): LightNovel!
    updateLightNovel(slug: String!, input: CreateLightNovelInput!): LightNovel!
    createCharacter(input: CreateCharacterInput!): Character!
    updateCharacter(slug: String!, input: CreateCharacterInput!): Character!
    createSeiyuu(input: CreateSeiyuuInput!): IndustryPerson!
    updateSeiyuu(slug: String!, input: CreateSeiyuuInput!): IndustryPerson!
    createStaff(input: CreateIndustryPersonInput!): IndustryPerson!
    updateStaff(slug: String!, input: CreateIndustryPersonInput!): IndustryPerson!
    createMangaka(input: CreateIndustryPersonInput!): IndustryPerson!
    updateMangaka(slug: String!, input: CreateIndustryPersonInput!): IndustryPerson!
    createMusicArtist(input: CreateMusicArtistInput!): MusicArtist!
    updateMusicArtist(slug: String!, input: CreateMusicArtistInput!): MusicArtist!
    createStudio(input: CreateStudioInput!): Studio!
    updateStudio(slug: String!, input: CreateStudioInput!): Studio!
    createPublisher(input: CreatePublisherInput!): Publisher!
    updatePublisher(slug: String!, input: CreatePublisherInput!): Publisher!
    createMagazine(input: CreateMagazineInput!): Magazine!
    updateMagazine(slug: String!, input: CreateMagazineInput!): Magazine!
    saveAnimeListEntry(animeSlug: String!, input: SaveAnimeListEntryInput!): AnimeListEntry!
    removeAnimeListEntry(animeSlug: String!): Boolean!
    savePublicationListEntry(medium: WorkMedium!, slug: String!, input: SavePublicationListEntryInput!): PublicationListEntry!
    removePublicationListEntry(medium: WorkMedium!, slug: String!): Boolean!
    setWorkFavorite(medium: WorkMedium!, slug: String!, favorite: Boolean!): Boolean!
    saveWorkReview(medium: WorkMedium!, slug: String!, input: SaveWorkReviewInput!): WorkReview!
  }

  input CreateStudioInput {
    displayName: String!
    nameKanji: String
    imageUrl: String!
    description: String
    foundation: String
    headquarters: String
    website: String
    externalLinks: ExternalLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }

  input CreatePublisherInput {
    displayName: String!
    imageUrl: String!
    description: String
    foundation: String
    headquarters: String
    externalLinks: ExternalLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }

  input CreateMagazineInput {
    title: String!
    description: String!
    imageUrl: String!
    foundation: String
    publisherId: ID!
    demography: String
    frequency: String
    externalLinks: ExternalLinksInput
    storeLinks: StoreLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
  }

  type StoreLinks {
    amazon: String cdJapan: String mercadoLivre: String rakuten: String shopee: String ebay: String
    otakuyasan: String hmv: String honto: String toranoana: String animate: String
  }
  type StaffCredit { personId: ID! role: String! contribution: String person: IndustryPerson! }
  type Manga {
    id: ID! title: String! slug: String! synopsis: String! coverUrl: String!
    alternativeTitles: [AlternativeTitle!]! status: String! publicationStatus: AnimePublicationStatus! adultContent: Boolean!
    startDate: String endDate: String magazine: String magazineEntity: Magazine publisher: String publisherEntity: Publisher demography: String genres: [String!]!
    chapters: Int! volumes: Int! serialization: String externalLinks: ExternalLinks!
    storeLinks: StoreLinks! characters: [Character!]! staffCredits: [StaffCredit!]! relatedWorks: [RelatedWork!]!
    createdAt: String! updatedAt: String! reviewSummary: ReviewSummary!
  }
  type LightNovel {
    id: ID! title: String! slug: String! synopsis: String! coverUrl: String!
    alternativeTitles: [AlternativeTitle!]! status: String! publicationStatus: AnimePublicationStatus! adultContent: Boolean!
    startDate: String endDate: String publisher: String publisherEntity: Publisher source: String genres: [String!]!
    chapters: Int! volumes: Int! externalLinks: ExternalLinks! storeLinks: StoreLinks!
    characters: [Character!]! staffCredits: [StaffCredit!]! relatedWorks: [RelatedWork!]!
    createdAt: String! updatedAt: String! reviewSummary: ReviewSummary!
  }
  input StaffCreditInput { personId: ID! role: String! contribution: String }
  input StoreLinksInput {
    amazon: String cdJapan: String mercadoLivre: String rakuten: String shopee: String ebay: String
    otakuyasan: String hmv: String honto: String toranoana: String animate: String
  }
  input CreateMangaInput {
    title: String! synopsis: String! coverUrl: String! alternativeTitles: [AlternativeTitleInput!] = []
    status: String! publicationStatus: AnimePublicationStatus! = DRAFT adultContent: Boolean! = false startDate: String endDate: String
    magazineId: ID magazine: String publisherId: ID publisher: String demography: String genres: [String!] = [] chapters: Int! volumes: Int!
    serialization: String characterIds: [ID!] = [] staffCredits: [StaffCreditInput!] = [] relatedWorks: [RelatedWorkInput!] = []
    externalLinks: ExternalLinksInput storeLinks: StoreLinksInput
  }
  input CreateLightNovelInput {
    title: String! synopsis: String! coverUrl: String! alternativeTitles: [AlternativeTitleInput!] = []
    status: String! publicationStatus: AnimePublicationStatus! = DRAFT adultContent: Boolean! = false startDate: String endDate: String
    publisherId: ID publisher: String source: String genres: [String!] = [] chapters: Int! volumes: Int!
    characterIds: [ID!] = [] staffCredits: [StaffCreditInput!] = [] relatedWorks: [RelatedWorkInput!] = []
    externalLinks: ExternalLinksInput storeLinks: StoreLinksInput
  }
`;

function badInput(error: unknown): never {
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "Dados inválidos";
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

function unauthenticated(message = "Não autenticado"): never {
  throw new GraphQLError(message, { extensions: { code: "UNAUTHENTICATED" } });
}

async function currentUser(context: GraphQLContext) {
  try {
    const payload = await context.request.jwtVerify<AccessTokenPayload>();
    if (payload.type !== "access") return null;
    return User.findById(payload.sub).select("+email");
  } catch {
    return null;
  }
}

async function profileViewer(context: GraphQLContext) {
  const authenticatedUser = await currentUser(context);
  if (authenticatedUser) return authenticatedUser;

  const token = context.request.cookies[REFRESH_COOKIE];
  if (!token) return null;

  try {
    const payload = verifyRefreshToken(context.app, token);
    const session = await Session.exists({
      _id: payload.sid,
      userId: payload.sub,
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    return session ? User.findById(payload.sub) : null;
  } catch {
    return null;
  }
}

async function requireZeus(context: GraphQLContext) {
  const user = await currentUser(context);
  if (!user) unauthenticated();
  if (user.role !== "ZEUS") {
    throw new GraphQLError("Acesso restrito à administração", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return user;
}

async function authResponse(context: GraphQLContext, user: any) {
  const tokens = await createSessionTokens(context.app, context.request, {
    id: user.id,
    role: user.role,
    username: user.username,
  });
  setRefreshCookie(context.reply, tokens.refreshToken);
  return { accessToken: tokens.accessToken, user };
}

function workHref(work: { medium: string; slug: string }) {
  const segment = work.medium === "LIGHT_NOVEL" ? "light-novel" : work.medium.toLowerCase();
  return `/${segment}/${work.slug}`;
}

async function effectiveCatalogWorkStatus(work: any) {
  if (work.medium !== "ANIME" || !work.entityId) return work.status;
  const anime = await Anime.findById(work.entityId).select("installments.status installments.statusOverride installments.startDate installments.endDate");
  return anime ? getOverallAnimeStatus(anime.installments) : work.status;
}

function normalizeAnimeRating(value: string | null | undefined) {
  const legacyRatings: Record<string, string> = {
    "PG-13": "PG13",
    "R-17+": "R17",
    "R+": "R18",
    Rx: "R18",
  };
  return value ? legacyRatings[value] ?? value : value;
}

function animeInstallmentValues(installment: any) {
  const startDate = installment.startDate ? new Date(`${installment.startDate}T00:00:00.000Z`) : null;
  const endDate = installment.endDate ? new Date(`${installment.endDate}T00:00:00.000Z`) : null;
  // Clientes antigos enviavam somente `status`; clientes novos enviam null para usar o modo automático.
  const statusOverride = installment.statusOverride === undefined
    ? installment.status as AnimeStatus
    : installment.statusOverride as AnimeStatus | null;
  const values = {
    ...installment,
    studio: installment.studioId ? null : installment.studioName,
    studioName: undefined,
    startDate,
    endDate,
    statusOverride,
    status: "ANNOUNCED" as AnimeStatus,
  };
  return { ...values, status: getEffectiveAnimeStatus(values) };
}

async function legacyAdultAnimeIds(includeAdult: boolean) {
  if (includeAdult) return [];
  return Anime.find({ rating: { $in: ["R18", "R+", "Rx"] } }).distinct("_id");
}

async function reviewSummaryFor(medium: "ANIME" | "MANGA" | "LIGHT_NOVEL", entityId: any) {
  const work = await CatalogWork.findOne({ medium, entityId });
  if (!work) return { average: 0, count: 0 };
  const [summary] = await WorkReview.aggregate<{ average: number; count: number }>([
    { $match: { workId: work._id } },
    { $group: { _id: null, average: { $avg: "$score" }, count: { $sum: 1 } } },
  ]);
  return summary ? { average: summary.average, count: summary.count } : { average: 0, count: 0 };
}

async function publicationWorkRelations(references: any[] = []) {
  const works = await CatalogWork.find({ _id: { $in: references.map((item) => item.workId) } });
  const byId = new Map(works.map((work) => [work.id, work]));
  return references.flatMap((reference) => {
    const work = byId.get(reference.workId.toString());
    return work ? [{ ...work.toObject(), id: work.id, relationType: reference.relationType, href: workHref(work) }] : [];
  });
}

async function validatePublicationWorkLinks(input: any) {
  const relatedIds = [...new Set(input.relatedWorks.map((item: any) => item.workId))];
  const characterIds = [...new Set(input.characterIds)];
  const personIds = [...new Set(input.staffCredits.map((credit: any) => credit.personId))];
  const [relatedCount, characterCount, personCount, publisherCount, magazineCount] = await Promise.all([
    CatalogWork.countDocuments({ _id: { $in: relatedIds } }),
    Character.countDocuments({ _id: { $in: characterIds } }),
    Person.countDocuments({ _id: { $in: personIds } }),
    input.publisherId ? Publisher.countDocuments({ _id: input.publisherId }) : Promise.resolve(0),
    input.magazineId ? Magazine.countDocuments({ _id: input.magazineId }) : Promise.resolve(0),
  ]);
  if (relatedCount !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
  if (characterCount !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
  if (personCount !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
  if (input.publisherId && publisherCount !== 1) badInput("A editora vinculada não existe mais");
  if (input.magazineId && magazineCount !== 1) badInput("A magazine vinculada não existe mais");
}

function publicationWorkValues(input: any) {
  return {
    ...input,
    publisher: input.publisherId ? null : input.publisher,
    magazine: input.magazineId ? null : input.magazine,
    externalLinks: input.externalLinks ?? {},
    storeLinks: input.storeLinks ?? {},
    startDate: input.startDate ? new Date(`${input.startDate}T00:00:00.000Z`) : null,
    endDate: input.endDate ? new Date(`${input.endDate}T00:00:00.000Z`) : null,
  };
}

async function syncCatalogWork(medium: "MANGA" | "LIGHT_NOVEL", work: any) {
  return CatalogWork.findOneAndUpdate(
    { medium, entityId: work._id },
    { title: work.title, slug: work.slug, coverUrl: work.coverUrl, status: work.status, publicationStatus: work.publicationStatus, adultContent: work.adultContent },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function createPublicationWork(Model: any, medium: "MANGA" | "LIGHT_NOVEL", label: string, input: any, user: any) {
  await validatePublicationWorkLinks(input);
  try {
    const work = await Model.create({ ...publicationWorkValues(input), slug: animeSlugFromTitle(input.title), createdBy: user._id });
    try {
      await syncCatalogWork(medium, work);
    } catch (error) {
      await Model.deleteOne({ _id: work._id });
      throw error;
    }
    return work;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new GraphQLError(`Já existe ${label} com este título`, { extensions: { code: "CONFLICT" } });
    }
    throw error;
  }
}

async function updatePublicationWork(Model: any, medium: "MANGA" | "LIGHT_NOVEL", label: string, slug: string, input: any) {
  const work = await Model.findOne({ slug });
  if (!work) throw new GraphQLError(`${label} não encontrado`, { extensions: { code: "NOT_FOUND" } });
  await validatePublicationWorkLinks(input);
  try {
    work.set({ ...publicationWorkValues(input), slug: animeSlugFromTitle(input.title) });
    await work.save();
    await syncCatalogWork(medium, work);
    return work;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new GraphQLError(`Já existe ${label.toLowerCase()} com este título`, { extensions: { code: "CONFLICT" } });
    }
    throw error;
  }
}

export const resolvers: IResolvers<any, GraphQLContext> = {
  WorkEditSuggestion: {
    id: (suggestion: any) => suggestion.id ?? suggestion._id.toString(),
    anime: (suggestion: any) => suggestion.animeId ? Anime.findById(suggestion.animeId) : null,
    manga: (suggestion: any) => suggestion.mangaId ? Manga.findById(suggestion.mangaId) : null,
    lightNovel: (suggestion: any) => suggestion.lightNovelId ? LightNovel.findById(suggestion.lightNovelId) : null,
    medium: (suggestion: any) => suggestion.lightNovelId ? "LIGHT_NOVEL" : suggestion.mangaId ? "MANGA" : "ANIME",
    proposer: async (suggestion: any) => {
      const user = await User.findById(suggestion.proposerId);
      return user ? { ...user.toObject(), id: user.id } : null;
    },
    createdAt: (suggestion: any) => suggestion.createdAt.toISOString(),
  },
  Anime: {
    id: (anime: any) => anime.id ?? anime._id.toString(),
    rating: (anime: any) => normalizeAnimeRating(anime.rating),
    createdAt: (anime: any) => anime.createdAt.toISOString(),
    updatedAt: (anime: any) => anime.updatedAt.toISOString(),
    reviewSummary: (anime: any) => reviewSummaryFor("ANIME", anime._id),
    relatedWorks: async (anime: any) => {
      const references = anime.relatedWorks ?? [];
      const works = await CatalogWork.find({ _id: { $in: references.map((item: any) => item.workId) } });
      const byId = new Map(works.map((work) => [work.id, work]));
      return references.flatMap((reference: any) => {
        const work = byId.get(reference.workId.toString());
        return work ? [{ ...work.toObject(), id: work.id, relationType: reference.relationType, href: workHref(work) }] : [];
      });
    },
    characterCredits: async (anime: any) => {
      const credits = anime.characterCredits ?? [];
      if (credits.length === 0) return [];
      const [characters, seiyuus] = await Promise.all([
        Character.find({ _id: { $in: credits.map((credit: any) => credit.characterId) } }),
        Person.find({ _id: { $in: credits.map((credit: any) => credit.seiyuuId) } }),
      ]);
      const charactersById = new Map(characters.map((character) => [character.id, character]));
      const seiyuusById = new Map(seiyuus.map((seiyuu) => [seiyuu.id, seiyuu]));
      return credits.flatMap((credit: any) => {
        const character = charactersById.get(credit.characterId.toString());
        const seiyuu = seiyuusById.get(credit.seiyuuId.toString());
        return character && seiyuu
          ? [{ characterId: character.id, seiyuuId: seiyuu.id, character, seiyuu }]
          : [];
      });
    },
    songCredits: async (anime: any) => {
      const credits = anime.songCredits ?? [];
      if (credits.length === 0) return [];
      const artistIds = credits.flatMap((credit: any) => [credit.artistId, ...(credit.featuredArtistIds ?? [])]);
      const artists = await MusicArtist.find({ _id: { $in: artistIds } });
      const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
      return credits.flatMap((credit: any) => {
        const artist = artistsById.get(credit.artistId.toString());
        const values = typeof credit.toObject === "function" ? credit.toObject() : credit;
        const featuredArtists = (credit.featuredArtistIds ?? []).flatMap((id: any) => {
          const featured = artistsById.get(id.toString());
          return featured ? [featured] : [];
        });
        return artist ? [{ ...values, artistId: artist.id, artist, featuredArtists }] : [];
      });
    },
    staffCredits: async (anime: any) => {
      const credits = anime.staffCredits ?? [];
      const people = await Person.find({ _id: { $in: credits.map((credit: any) => credit.personId) } });
      const byId = new Map(people.map((person) => [person.id, person]));
      return credits.flatMap((credit: any) => {
        const person = byId.get(credit.personId.toString());
        return person ? [{ personId: person.id, role: credit.role, contribution: credit.contribution, person }] : [];
      });
    },
  },
  AnimeInstallment: {
    id: (installment: any) => installment.id ?? installment._id.toString(),
    status: (installment: any) => getEffectiveAnimeStatus(installment),
    statusOverride: (installment: any) => getAnimeStatusOverride(installment),
    studio: async (installment: any) => installment.studioId ? Studio.findById(installment.studioId) : null,
    studioName: (installment: any) => installment.studio ?? null,
    startDate: (installment: any) => installment.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (installment: any) => installment.endDate?.toISOString().slice(0, 10) ?? null,
  },
  RelatedWork: {
    id: (work: any) => work.id ?? work._id.toString(),
    status: effectiveCatalogWorkStatus,
  },
  WorkSearchResult: {
    id: (work: any) => work.id ?? work._id.toString(),
    href: (work: any) => work.href ?? workHref(work),
    status: effectiveCatalogWorkStatus,
  },
  IndustryPerson: {
    id: (person: any) => person.id ?? person._id.toString(),
    roles: (person: any) => person.roles ?? [],
    occupations: (person: any) => person.occupations ?? [],
    externalLinks: (person: any) => person.externalLinks ?? {},
    animeCredits: async (person: any) => {
      const animes = await Anime.find({
        "staffCredits.personId": person._id,
        publicationStatus: "PUBLISHED",
      }).sort({ title: 1 });
      return animes.flatMap((anime) => anime.staffCredits
        .filter((credit) => credit.personId.equals(person._id))
        .map((credit) => ({
          anime: {
            id: anime.id,
            title: anime.title,
            slug: anime.slug,
            coverUrl: anime.coverUrl,
            startDate: anime.installments[0]?.startDate?.toISOString().slice(0, 10) ?? null,
            endDate: anime.installments.at(-1)?.endDate?.toISOString().slice(0, 10) ?? null,
          },
          role: credit.role,
          contribution: credit.contribution,
        })));
    },
    mangaCredits: async (person: any) => {
      const mangas = await Manga.find({
        "staffCredits.personId": person._id,
        publicationStatus: "PUBLISHED",
      }).sort({ title: 1 });
      return mangas.flatMap((manga) => manga.staffCredits
        .filter((credit) => credit.personId.equals(person._id))
        .map((credit) => ({ manga, role: credit.role, contribution: credit.contribution })));
    },
    createdAt: (person: any) => person.createdAt.toISOString(),
    updatedAt: (person: any) => person.updatedAt.toISOString(),
  },
  Studio: {
    id: (studio: any) => studio.id ?? studio._id.toString(),
    externalLinks: (studio: any) => ({
      website: studio.externalLinks?.website ?? studio.website ?? undefined,
      x: studio.externalLinks?.x,
      instagram: studio.externalLinks?.instagram,
      pixiv: studio.externalLinks?.pixiv,
      youtube: studio.externalLinks?.youtube,
    }),
    animeCredits: async (studio: any) => {
      const animes = await Anime.find({ "installments.studioId": studio._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 });
      return animes.map((anime) => {
        const installment = anime.installments.find((item) => item.studioId?.equals(studio._id));
        return { anime: {
          id: anime.id,
          title: anime.title,
          slug: anime.slug,
          coverUrl: anime.coverUrl,
          startDate: installment?.startDate?.toISOString().slice(0, 10) ?? null,
          endDate: installment?.endDate?.toISOString().slice(0, 10) ?? null,
          broadcastSeason: installment?.broadcastSeason ?? null,
        } };
      });
    },
    createdAt: (studio: any) => studio.createdAt.toISOString(),
    updatedAt: (studio: any) => studio.updatedAt.toISOString(),
  },
  Character: {
    id: (character: any) => character.id ?? character._id.toString(),
    appearances: async (character: any) => {
      const [animes, mangas, lightNovels] = await Promise.all([
        Anime.find({
          "characterCredits.characterId": character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl installments.format"),
        Manga.find({
          characterIds: character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl"),
        LightNovel.find({
          characterIds: character._id,
          publicationStatus: "PUBLISHED",
        }).select("title slug coverUrl"),
      ]);

      const appearances = [
        ...animes.map((work) => ({
          id: work.id,
          title: work.title,
          slug: work.slug,
          coverUrl: work.coverUrl,
          medium: "ANIME",
          formats: [...new Set(work.installments.map((installment) => installment.format))],
        })),
        ...mangas.map((work) => ({ id: work.id, title: work.title, slug: work.slug, coverUrl: work.coverUrl, medium: "MANGA", formats: [] })),
        ...lightNovels.map((work) => ({ id: work.id, title: work.title, slug: work.slug, coverUrl: work.coverUrl, medium: "LIGHT_NOVEL", formats: [] })),
      ];
      const mediumOrder: Record<string, number> = { MANGA: 0, LIGHT_NOVEL: 1, ANIME: 2 };
      return appearances.sort((a, b) =>
        (mediumOrder[a.medium] ?? Number.MAX_SAFE_INTEGER) - (mediumOrder[b.medium] ?? Number.MAX_SAFE_INTEGER)
        || a.title.localeCompare(b.title, "pt-BR"),
      );
    },
    createdAt: (character: any) => character.createdAt.toISOString(),
    updatedAt: (character: any) => character.updatedAt.toISOString(),
  },
  MusicArtist: {
    id: (artist: any) => artist.id ?? artist._id.toString(),
    platformLinks: (artist: any) => artist.platformLinks ?? {},
    discography: (artist: any) => artist.discography ?? [],
    animeSongs: async (artist: any) => {
      const animes = await Anime.find({ publicationStatus: "PUBLISHED", $or: [
        { "songCredits.artistId": artist._id },
        { "songCredits.featuredArtistIds": artist._id },
      ] });
      const featuredIds = animes.flatMap((anime) => anime.songCredits.flatMap((credit) => credit.featuredArtistIds));
      const featuredPeople = await MusicArtist.find({ _id: { $in: featuredIds } });
      const featuredById = new Map(featuredPeople.map((featured) => [featured.id, featured]));
      return animes.flatMap((anime) => anime.songCredits
        .filter((credit) => credit.artistId.equals(artist._id) || credit.featuredArtistIds.some((id) => id.equals(artist._id)))
        .map((credit) => ({
          anime: { id: anime.id, title: anime.title, slug: anime.slug, coverUrl: anime.coverUrl },
          songTitle: credit.songTitle,
          featuredArtists: credit.featuredArtistIds.flatMap((id) => {
            const featured = featuredById.get(id.toString());
            return featured ? [featured] : [];
          }),
          type: credit.type,
          sequence: credit.sequence,
          episodeRange: credit.episodeRange,
        })));
    },
    createdAt: (artist: any) => artist.createdAt.toISOString(),
    updatedAt: (artist: any) => artist.updatedAt.toISOString(),
  },
  AnimeListEntry: {
    id: (entry: any) => entry.id ?? entry._id.toString(),
    anime: async (entry: any) => Anime.findById(entry.animeId),
    createdAt: (entry: any) => entry.createdAt.toISOString(),
    updatedAt: (entry: any) => entry.updatedAt.toISOString(),
  },
  PublicationListEntry: {
    id: (entry: any) => entry.id ?? entry._id.toString(),
    work: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId);
      return work ? { ...work.toObject(), id: work.id, href: workHref(work) } : null;
    },
    totalChapters: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId).select("medium entityId");
      if (!work) return 0;
      const publication = work.medium === "MANGA"
        ? await Manga.findById(work.entityId).select("chapters")
        : await LightNovel.findById(work.entityId).select("chapters");
      return publication?.chapters ?? 0;
    },
    genres: async (entry: any) => {
      const work = await CatalogWork.findById(entry.workId).select("medium entityId");
      if (!work) return [];
      const publication = work.medium === "MANGA"
        ? await Manga.findById(work.entityId).select("genres")
        : await LightNovel.findById(work.entityId).select("genres");
      return publication?.genres ?? [];
    },
    createdAt: (entry: any) => entry.createdAt.toISOString(),
    updatedAt: (entry: any) => entry.updatedAt.toISOString(),
  },
  WorkReview: {
    updatedAt: (review: any) => review.updatedAt.toISOString(),
  },
  PublicWorkReview: {
    id: (review: any) => review.id ?? review._id.toString(),
    updatedAt: (review: any) => review.updatedAt.toISOString(),
  },
  UserWorkReview: {
    id: (review: any) => review.id ?? review._id.toString(),
    updatedAt: (review: any) => review.updatedAt.toISOString(),
  },
  Manga: {
    id: (manga: any) => manga.id ?? manga._id.toString(),
    startDate: (manga: any) => manga.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (manga: any) => manga.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: (manga: any) => manga.createdAt.toISOString(),
    updatedAt: (manga: any) => manga.updatedAt.toISOString(),
    reviewSummary: (manga: any) => reviewSummaryFor("MANGA", manga._id),
    characters: (manga: any) => Character.find({ _id: { $in: manga.characterIds ?? [] } }),
    relatedWorks: (manga: any) => publicationWorkRelations(manga.relatedWorks),
    publisherEntity: (manga: any) => manga.publisherId ? Publisher.findById(manga.publisherId) : null,
    magazineEntity: (manga: any) => manga.magazineId ? Magazine.findById(manga.magazineId) : null,
  },
  LightNovel: {
    id: (novel: any) => novel.id ?? novel._id.toString(),
    startDate: (novel: any) => novel.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: (novel: any) => novel.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: (novel: any) => novel.createdAt.toISOString(),
    updatedAt: (novel: any) => novel.updatedAt.toISOString(),
    reviewSummary: (novel: any) => reviewSummaryFor("LIGHT_NOVEL", novel._id),
    characters: (novel: any) => Character.find({ _id: { $in: novel.characterIds ?? [] } }),
    relatedWorks: (novel: any) => publicationWorkRelations(novel.relatedWorks),
    publisherEntity: (novel: any) => novel.publisherId ? Publisher.findById(novel.publisherId) : null,
  },
  Publisher: {
    id: (publisher: any) => publisher.id ?? publisher._id.toString(),
    externalLinks: (publisher: any) => publisher.externalLinks ?? {},
    magazines: (publisher: any) => Magazine.find({ publisherId: publisher._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    lightNovels: (publisher: any) => LightNovel.find({ publisherId: publisher._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    createdAt: (publisher: any) => publisher.createdAt.toISOString(),
    updatedAt: (publisher: any) => publisher.updatedAt.toISOString(),
  },
  Magazine: {
    id: (magazine: any) => magazine.id ?? magazine._id.toString(),
    externalLinks: (magazine: any) => magazine.externalLinks ?? {},
    storeLinks: (magazine: any) => magazine.storeLinks ?? {},
    publisher: (magazine: any) => Publisher.findById(magazine.publisherId),
    mangas: (magazine: any) => Manga.find({ magazineId: magazine._id, publicationStatus: "PUBLISHED" }).sort({ title: 1 }),
    createdAt: (magazine: any) => magazine.createdAt.toISOString(),
    updatedAt: (magazine: any) => magazine.updatedAt.toISOString(),
  },
  StaffCredit: {
    person: (credit: any) => Person.findById(credit.personId),
  },
  User: {
    id: (user: any) => user.id ?? user._id.toString(),
    showAdultContent: (user: any) => Boolean(user.showAdultContent),
    hideAdultContentFromVisitors: (user: any) => Boolean(user.hideAdultContentFromVisitors),
    createdAt: (user: any) => user.createdAt.toISOString(),
    updatedAt: (user: any) => user.updatedAt.toISOString(),
  },
  PublicUser: {
    id: (user: any) => user.id ?? user._id.toString(),
    createdAt: (user: any) => user.createdAt.toISOString(),
  },
  Query: {
    me: async (_root, _args, context: GraphQLContext) => currentUser(context),
    user: async (_root, args) => {
      const result = usernameSchema.safeParse(args);
      if (!result.success) badInput("Nome de usuário inválido");
      return User.findOne({ username: result.data.username });
    },
    dailyFeaturedAnime: async (_root, args) => {
      const candidates = await Anime.find({
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult
          ? {}
          : {
              adultContent: { $ne: true },
              rating: { $nin: ["R18", "R+", "Rx"] },
            }),
      }).sort({ title: 1, _id: 1 });

      return pickDailyItem(candidates);
    },
    topRatedWorks: async (_root, args) => {
      const hiddenAnimeIds = await legacyAdultAnimeIds(Boolean(args.includeAdult));
      const limit = Number.isInteger(args.limit)
        ? Math.min(Math.max(args.limit, 1), 100)
        : 5;
      const ranking = await WorkReview.aggregate<{
        work: {
          title: string;
          slug: string;
          medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
          coverUrl: string;
        };
        score: number;
        ratingCount: number;
      }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
            ratingCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: CatalogWork.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "work",
          },
        },
        { $unwind: "$work" },
        {
          $match: {
            "work.publicationStatus": "PUBLISHED",
            ...(args.medium ? { "work.medium": args.medium } : {}),
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
            ...(hiddenAnimeIds.length ? { "work.entityId": { $nin: hiddenAnimeIds } } : {}),
          },
        },
        { $sort: { score: -1, ratingCount: -1, "work.title": 1 } },
        { $limit: limit },
      ]);

      return ranking.map((item) => ({
        title: item.work.title,
        slug: item.work.slug,
        medium: item.work.medium,
        coverUrl: item.work.coverUrl,
        score: item.score,
        ratingCount: item.ratingCount,
      }));
    },
    discoveryWorks: async (_root, args) => {
      const publishedFilter = {
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      };
      const [animes, mangas, novels] = await Promise.all([
        Anime.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: { ...publishedFilter, ...(args.includeAdult ? {} : { rating: { $ne: "R18" } }) } },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
        Manga.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: publishedFilter },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
        LightNovel.aggregate<{ title: string; slug: string; coverUrl: string; synopsis: string }>([
          { $match: publishedFilter },
          { $sample: { size: 1 } },
          { $project: { title: 1, slug: 1, coverUrl: 1, synopsis: 1 } },
        ]),
      ]);

      return [
        ...animes.map((item) => ({ ...item, medium: "ANIME", description: item.synopsis })),
        ...mangas.map((item) => ({ ...item, medium: "MANGA", description: item.synopsis })),
        ...novels.map((item) => ({ ...item, medium: "LIGHT_NOVEL", description: item.synopsis })),
      ];
    },
    anime: async (_root, args, context: GraphQLContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Slug inválido");

      const anime = await Anime.findOne({ slug: result.data.slug });
      if (!anime) return null;
      if (anime.publicationStatus === "PUBLISHED") return anime;

      const user = await currentUser(context);
      return user?.role === "ZEUS" ? anime : null;
    },
    seasonalAnime: async (_root, args) => {
      const season = args.season as AnimeSeason;
      const year = Number(args.year);
      const limit = args.limit == null ? null : Number(args.limit);
      if (!Number.isInteger(year) || year < 1900 || year > 3000) badInput("Ano de temporada inválido");
      if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
        badInput("O limite deve estar entre 1 e 100");
      }

      const dateRanges = getAnimeSeasonDateRanges(season, year);
      const candidates = await Anime.find({
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : {
          adultContent: { $ne: true },
          rating: { $nin: ["R18", "R+", "Rx"] },
        }),
        $or: [
          { "installments.broadcastSeason": getBroadcastSeasonPattern(season, year) },
          ...dateRanges.map(({ start, end }) => ({
            "installments.startDate": { $gte: start, $lt: end },
          })),
        ],
      });

      const matches = candidates.flatMap((anime) => {
        const installments = anime.installments
          .filter((item) => installmentMatchesSeason(item, season, year))
          .sort((left, right) => {
            if (!left.startDate) return 1;
            if (!right.startDate) return -1;
            return left.startDate.getTime() - right.startDate.getTime();
          });
        const selectedInstallments = args.deduplicate === false ? installments : installments.slice(0, 1);
        return selectedInstallments.map((installment) => ({ anime, installment }));
      }).sort((left, right) => {
        const leftTime = left.installment.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const rightTime = right.installment.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return leftTime - rightTime || left.anime.title.localeCompare(right.anime.title, "pt-BR");
      });

      if (limit === null) return matches;

      const randomizedMatches = [...matches];
      for (let index = randomizedMatches.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const current = randomizedMatches[index]!;
        randomizedMatches[index] = randomizedMatches[randomIndex]!;
        randomizedMatches[randomIndex] = current;
      }
      return randomizedMatches.slice(0, limit);
    },
    manga: async (_root, args, context: GraphQLContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const manga = await Manga.findOne({ slug: result.data.slug });
      if (!manga) return null;
      if (manga.publicationStatus === "PUBLISHED") return manga;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? manga : null;
    },
    dailyMangaRecommendation: async (_root, args) => {
      const candidates = await WorkReview.aggregate<{ entityId: any }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
          },
        },
        { $match: { score: { $gt: 6 } } },
        {
          $lookup: {
            from: CatalogWork.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "work",
          },
        },
        { $unwind: "$work" },
        {
          $match: {
            "work.medium": "MANGA",
            "work.publicationStatus": "PUBLISHED",
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
          },
        },
        { $sort: { "work.slug": 1 } },
        { $project: { _id: 0, entityId: "$work.entityId" } },
      ]);
      if (!candidates.length) return null;

      const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
      const dateHash = Array.from(dateKey).reduce(
        (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
        2166136261,
      );
      const selected = candidates[dateHash % candidates.length];
      return Manga.findById(selected.entityId);
    },
    dailyLightNovelRecommendation: async (_root, args) => {
      const candidates = await WorkReview.aggregate<{ entityId: any }>([
        {
          $group: {
            _id: "$workId",
            score: { $avg: "$score" },
          },
        },
        { $match: { score: { $gt: 6 } } },
        {
          $lookup: {
            from: CatalogWork.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "work",
          },
        },
        { $unwind: "$work" },
        {
          $match: {
            "work.medium": "LIGHT_NOVEL",
            "work.publicationStatus": "PUBLISHED",
            ...(args.includeAdult ? {} : { "work.adultContent": { $ne: true } }),
          },
        },
        { $sort: { "work.slug": 1 } },
        { $project: { _id: 0, entityId: "$work.entityId" } },
      ]);
      if (!candidates.length) return null;

      const dateKey = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
      const dateHash = Array.from(dateKey).reduce(
        (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
        2166136261,
      );
      const selected = candidates[dateHash % candidates.length];
      return LightNovel.findById(selected.entityId);
    },
    recentPublishingMangas: async (_root, args) => {
      const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
      return Manga.find({
        publicationStatus: "PUBLISHED",
        status: "PUBLISHING",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      }).sort({ createdAt: -1 }).limit(limit);
    },
    browseMangas: async (_root, args) => Manga.find({
      publicationStatus: "PUBLISHED",
      ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
    }).sort({ title: 1, _id: 1 }),
    recentPublishingLightNovels: async (_root, args) => {
      const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
      return LightNovel.find({
        publicationStatus: "PUBLISHED",
        status: "PUBLISHING",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      }).sort({ createdAt: -1, _id: 1 }).limit(limit);
    },
    browseLightNovels: async (_root, args) => LightNovel.find({
      publicationStatus: "PUBLISHED",
      ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
    }).sort({ title: 1, _id: 1 }),
    lightNovel: async (_root, args, context: GraphQLContext) => {
      const result = animeSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const novel = await LightNovel.findOne({ slug: result.data.slug });
      if (!novel) return null;
      if (novel.publicationStatus === "PUBLISHED") return novel;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? novel : null;
    },
    publishingLightNovelSpotlight: async (_root, args) => {
      const [novel] = await LightNovel.aggregate([
        {
          $match: {
            publicationStatus: "PUBLISHED",
            status: "PUBLISHING",
            ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
          },
        },
        { $sample: { size: 1 } },
      ]);
      return novel ?? null;
    },
    character: async (_root, args, context: GraphQLContext) => {
      const result = characterSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const character = await Character.findOne({ slug: result.data.slug });
      if (!character) return null;
      if (character.publicationStatus === "PUBLISHED") return character;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? character : null;
    },
    seiyuu: async (_root, args, context: GraphQLContext) => {
      const result = seiyuuSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "SEIYUU" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    staff: async (_root, args, context: GraphQLContext) => {
      const result = industryPersonSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "STAFF" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    mangaka: async (_root, args, context: GraphQLContext) => {
      const result = industryPersonSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const person = await Person.findOne({ slug: result.data.slug, roles: "MANGAKA" });
      if (!person) return null;
      if (person.publicationStatus === "PUBLISHED") return person;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? person : null;
    },
    musicArtist: async (_root, args, context: GraphQLContext) => {
      const result = musicArtistSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const artist = await MusicArtist.findOne({ slug: result.data.slug });
      if (!artist) return null;
      if (artist.publicationStatus === "PUBLISHED") return artist;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? artist : null;
    },
    studio: async (_root, args, context: GraphQLContext) => {
      const result = studioSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const studio = await Studio.findOne({ slug: result.data.slug });
      if (!studio) return null;
      if (studio.publicationStatus === "PUBLISHED") return studio;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? studio : null;
    },
    publisher: async (_root, args, context: GraphQLContext) => {
      const result = publisherSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const publisher = await Publisher.findOne({ slug: result.data.slug });
      if (!publisher) return null;
      if (publisher.publicationStatus === "PUBLISHED") return publisher;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? publisher : null;
    },
    magazine: async (_root, args, context: GraphQLContext) => {
      const result = magazineSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço inválido");
      const magazine = await Magazine.findOne({ slug: result.data.slug });
      if (!magazine) return null;
      if (magazine.publicationStatus === "PUBLISHED") return magazine;
      const user = await currentUser(context);
      return user?.role === "ZEUS" ? magazine : null;
    },
    charactersBySeiyuu: async (_root, args) => {
      const result = characterSlugSchema.safeParse(args);
      if (!result.success) badInput("Endereço de seiyuu inválido");
      const seiyuu = await Person.findOne({ slug: result.data.slug, roles: "SEIYUU" }).select("_id");
      const animes = seiyuu
        ? await Anime.find({
            "characterCredits.seiyuuId": seiyuu._id,
            publicationStatus: "PUBLISHED",
          }).select("title characterCredits")
        : [];
      const linkedCharacterIds = animes.flatMap((anime) =>
        anime.characterCredits
          .filter((credit) => credit.seiyuuId.equals(seiyuu!._id))
          .map((credit) => credit.characterId),
      );
      const characters = await Character.find({
        publicationStatus: "PUBLISHED",
        $or: [
          { "voiceCredits.seiyuuSlug": result.data.slug },
          { _id: { $in: linkedCharacterIds } },
        ],
      }).sort({ nameRomaji: 1 });

      return characters.map((character) => {
        const linkedCredits = animes
          .filter((anime) => anime.characterCredits.some((credit) =>
            credit.characterId.equals(character._id) && credit.seiyuuId.equals(seiyuu!._id),
          ))
          .map((anime) => ({ seiyuuSlug: result.data.slug, animeTitle: anime.title }));
        const voiceCredits = [...character.voiceCredits, ...linkedCredits].filter(
          (credit, index, items) => items.findIndex((item) =>
            item.seiyuuSlug === credit.seiyuuSlug && item.animeTitle === credit.animeTitle,
          ) === index,
        );
        return { ...character.toObject(), voiceCredits };
      });
    },
    searchWorks: async (_root, args) => {
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hiddenAnimeIds = await legacyAdultAnimeIds(Boolean(args.includeAdult));
      return CatalogWork.find({
        title: { $regex: safeQuery, $options: "i" },
        publicationStatus: "PUBLISHED",
        ...(args.medium ? { medium: args.medium } : {}),
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      }).sort({ title: 1 }).limit(12);
    },
    searchPeople: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Person.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchStudios: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Studio.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchPublishers: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Publisher.find({ displayName: { $regex: safeQuery, $options: "i" } }).sort({ displayName: 1 }).limit(12);
    },
    searchMagazines: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      if (query.length < 2) return [];
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return Magazine.find({ title: { $regex: safeQuery, $options: "i" } }).sort({ title: 1 }).limit(12);
    },
    pendingWorkEditSuggestions: async (_root, _args, context: GraphQLContext) => {
      await requireZeus(context);
      return AnimeEditSuggestion.find({ status: "PENDING" }).sort({ createdAt: 1 });
    },
    adminAnimes: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return Anime.find(filter).sort({ updatedAt: -1, title: 1 });
    },
    adminMangas: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Manga.find(filter).sort({ updatedAt: -1, title: 1 });
    },
    adminLightNovels: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return LightNovel.find(filter).sort({ updatedAt: -1, title: 1 });
    },
    adminCharacters: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { nameRomaji: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return Character.find(filter).sort({ updatedAt: -1, nameRomaji: 1 });
    },
    adminSeiyuus: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = {
        roles: "SEIYUU",
        ...(query
          ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
          : {}),
      };
      return Person.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminStaff: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      return Person.find({
        roles: "STAFF",
        ...(query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}),
      }).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMangakas: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      return Person.find({
        roles: "MANGAKA",
        ...(query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}),
      }).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMusicArtists: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query
        ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
        : {};
      return MusicArtist.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminStudios: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Studio.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminPublishers: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { displayName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Publisher.find(filter).sort({ updatedAt: -1, displayName: 1 });
    },
    adminMagazines: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const query = typeof args.query === "string" ? args.query.trim() : "";
      const filter = query ? { title: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
      return Magazine.find(filter).sort({ updatedAt: -1, title: 1 });
    },
    myAnimeListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = animeSlugSchema.safeParse({ slug: args.animeSlug });
      if (!result.success) badInput("Anime inválido");
      const anime = await Anime.findOne({ slug: result.data.slug }).select("_id");
      if (!anime) return null;
      return AnimeListEntry.findOne({ userId: user._id, animeId: anime._id });
    },
    myPublicationListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = getPublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        medium: result.data.medium,
        slug: result.data.slug,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) return null;
      return PublicationListEntry.findOne({ userId: user._id, workId: work._id });
    },
    animeList: async (_root, args, context: GraphQLContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username }).select("_id hideAdultContentFromVisitors");
      if (!user) return [];
      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const hiddenAnimeIds = await legacyAdultAnimeIds(includeAdult);
      const works = await CatalogWork.find({
        medium: "ANIME",
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      }).select("entityId");
      return AnimeListEntry.find({
        userId: user._id,
        animeId: { $in: works.map((work) => work.entityId) },
      }).sort({ updatedAt: -1 });
    },
    publicationList: async (_root, args, context: GraphQLContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success || !["MANGA", "LIGHT_NOVEL"].includes(args.medium)) badInput("Lista inválida");
      const user = await User.findOne({ username: result.data.username }).select("_id hideAdultContentFromVisitors");
      if (!user) return [];
      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const works = await CatalogWork.find({
        medium: args.medium,
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
      }).select("_id");
      return PublicationListEntry.find({
        userId: user._id,
        workId: { $in: works.map((work) => work._id) },
      }).sort({ updatedAt: -1 });
    },
    userFavorites: async (_root, args, context: GraphQLContext) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username })
        .select("_id hideAdultContentFromVisitors");
      if (!user) return [];

      const viewer = await profileViewer(context);
      const isOwner = Boolean(viewer?._id.equals(user._id));
      const includeAdult = isOwner || (Boolean(args.includeAdult) && !user.hideAdultContentFromVisitors);
      const favorites = await WorkFavorite.find({ userId: user._id }).sort({ createdAt: -1 });
      const hiddenAnimeIds = await legacyAdultAnimeIds(includeAdult);
      const works = await CatalogWork.find({
        _id: { $in: favorites.map((favorite) => favorite.workId) },
        publicationStatus: "PUBLISHED",
        ...(includeAdult ? {} : { adultContent: { $ne: true } }),
        ...(hiddenAnimeIds.length ? { entityId: { $nin: hiddenAnimeIds } } : {}),
      });
      const worksById = new Map(works.map((work) => [work.id, work]));

      return favorites.flatMap((favorite) => {
        const work = worksById.get(favorite.workId.toString());
        if (!work) return [];
        return [{
          id: favorite.id,
          createdAt: favorite.createdAt.toISOString(),
          work: { ...work.toObject(), id: work.id, href: workHref(work) },
        }];
      });
    },
    myWorkFavorite: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        ...result.data,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) return false;
      return Boolean(await WorkFavorite.exists({ userId: user._id, workId: work._id }));
    },
    userReviews: async (_root, args) => {
      const result = usernameSchema.safeParse({ username: args.username });
      if (!result.success) badInput("Nome de usuário inválido");
      const user = await User.findOne({ username: result.data.username }).select("_id");
      if (!user) return [];

      const reviews = await WorkReview.find({ userId: user._id }).sort({ updatedAt: -1 });
      const works = await CatalogWork.find({
        _id: { $in: reviews.map((review) => review.workId) },
        publicationStatus: "PUBLISHED",
        ...(args.includeAdult ? {} : { adultContent: { $ne: true } }),
      });
      const worksById = new Map(works.map((work) => [work.id, work]));

      return reviews.flatMap((review) => {
        const work = worksById.get(review.workId.toString());
        if (!work) return [];
        return [{
          ...review.toObject(),
          id: review.id,
          work: { ...work.toObject(), id: work.id, href: workHref(work) },
        }];
      });
    },
    workReviewComments: async (_root, args) => {
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({ ...result.data, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) return [];

      const reviews = await WorkReview.find({
        workId: work._id,
        comment: { $type: "string", $ne: "" },
      }).sort({ updatedAt: -1 });
      const users = await User.find({ _id: { $in: reviews.map((review) => review.userId) } })
        .select("username displayName role avatarUrl createdAt");
      const usersById = new Map(users.map((user) => [user.id, user]));

      return reviews.flatMap((review) => {
        const author = usersById.get(review.userId.toString());
        return author ? [{ ...review.toObject(), id: review.id, author }] : [];
      });
    },
    myWorkReview: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({ ...result.data, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) return null;
      return WorkReview.findOne({ userId: user._id, workId: work._id });
    },
  },
  Mutation: {
    register: async (_root, args, context: GraphQLContext) => {
      const result = registerSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { username, displayName, email, password } = result.data.input;
      const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

      try {
        // Role is deliberately not accepted from public input.
        const user = await User.create({ username, displayName, email, passwordHash, role: "FREE" });
        return authResponse(context, user);
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("E-mail ou nome de usuário já cadastrado", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    login: async (_root, args, context: GraphQLContext) => {
      const result = loginSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const user = await User.findOne({ email: result.data.input.email }).select("+passwordHash +email");
      const valid = user && (await bcrypt.compare(result.data.input.password, user.passwordHash));
      if (!valid) unauthenticated("E-mail ou senha inválidos");

      return authResponse(context, user);
    },
    refreshSession: async (_root, _args, context: GraphQLContext) => {
      const token = context.request.cookies[REFRESH_COOKIE];
      if (!token) unauthenticated();

      try {
        const payload = verifyRefreshToken(context.app, token);
        const session = await Session.findOne({
          _id: payload.sid,
          userId: payload.sub,
          tokenHash: hashToken(token),
          expiresAt: { $gt: new Date() },
        });
        if (!session) unauthenticated("Sessão inválida ou expirada");

        const user = await User.findById(payload.sub).select("+email");
        if (!user) unauthenticated();
        setRefreshCookie(context.reply, token);
        return { accessToken: createAccessToken(context.app, user), user };
      } catch (error) {
        clearRefreshCookie(context.reply);
        if (error instanceof GraphQLError) throw error;
        unauthenticated("Sessão inválida ou expirada");
      }
    },
    logout: async (_root, _args, context: GraphQLContext) => {
      const token = context.request.cookies[REFRESH_COOKIE];
      clearRefreshCookie(context.reply);
      if (!token) return true;

      try {
        const payload = verifyRefreshToken(context.app, token);
        await Session.deleteOne({ _id: payload.sid, tokenHash: hashToken(token) });
      } catch {
        // Logout remains idempotent even with an invalid/expired cookie.
      }
      return true;
    },
    updateMyProfile: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();

      const result = updateProfileSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      user.username = result.data.input.username;
      user.displayName = result.data.input.displayName;
      user.bio = result.data.input.bio;
      user.email = result.data.input.email;
      user.showAdultContent = result.data.input.showAdultContent;
      user.hideAdultContentFromVisitors = result.data.input.hideAdultContentFromVisitors;

      try {
        await user.save();
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("E-mail ou nome de usuário já cadastrado", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }

      return { accessToken: createAccessToken(context.app, user), user };
    },
    createAnime: async (_root, args, context: GraphQLContext) => {
      const user = await requireZeus(context);
      const result = createAnimeSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        const relatedIds = [...new Set(input.relatedWorks.map((item) => item.workId))];
        const existingRelatedWorks = await CatalogWork.countDocuments({ _id: { $in: relatedIds } });
        if (existingRelatedWorks !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
        const personIds = [...new Set(input.staffCredits.map((credit) => credit.personId))];
        const existingPeople = await Person.countDocuments({ _id: { $in: personIds } });
        if (existingPeople !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
        const characterIds = [...new Set(input.characterCredits.map((credit) => credit.characterId))];
        const seiyuuIds = [...new Set(input.characterCredits.map((credit) => credit.seiyuuId))];
        const [existingCharacters, existingSeiyuus] = await Promise.all([
          Character.countDocuments({ _id: { $in: characterIds } }),
          Person.countDocuments({ _id: { $in: seiyuuIds }, roles: "SEIYUU" }),
        ]);
        if (existingCharacters !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
        if (existingSeiyuus !== seiyuuIds.length) badInput("Um dos seiyuus vinculados não existe mais");
        const artistIds = [...new Set(input.songCredits.flatMap((credit) => [credit.artistId, ...credit.featuredArtistIds]))];
        const existingArtists = await MusicArtist.countDocuments({ _id: { $in: artistIds } });
        if (existingArtists !== artistIds.length) badInput("Um dos artistas vinculados não existe mais");
        const studioIds = [...new Set(input.installments.flatMap((item) => item.studioId ? [item.studioId] : []))];
        const existingStudios = await Studio.countDocuments({ _id: { $in: studioIds } });
        if (existingStudios !== studioIds.length) badInput("Um dos estúdios vinculados não existe mais");

        const anime = await Anime.create({
          ...input,
          adultContent: input.adultContent || normalizeAnimeRating(input.rating) === "R18",
          slug: animeSlugFromTitle(input.title),
          externalLinks: input.externalLinks ?? {},
          streamingLinks: input.streamingLinks ?? {},
          installments: input.installments.map(animeInstallmentValues),
          createdBy: user._id,
        });
        try {
          await CatalogWork.create({
            title: anime.title,
            slug: anime.slug,
            medium: "ANIME",
            coverUrl: anime.coverUrl,
            status: getOverallAnimeStatus(anime.installments),
            publicationStatus: anime.publicationStatus,
            adultContent: anime.adultContent,
            entityId: anime._id,
          });
        } catch (error) {
          await Anime.deleteOne({ _id: anime._id });
          throw error;
        }
        return anime;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um anime cadastrado com este título", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    suggestWorkEdit: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const medium = args.medium as "ANIME" | "MANGA" | "LIGHT_NOVEL";
      if (medium !== "ANIME" && medium !== "MANGA" && medium !== "LIGHT_NOVEL") badInput("Tipo de obra não suportado para sugestões");
      const work = medium === "ANIME"
        ? await Anime.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" })
        : medium === "MANGA"
          ? await Manga.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" })
          : await LightNovel.findOne({ slug: args.slug, publicationStatus: "PUBLISHED" });
      if (!work) throw new GraphQLError("Obra não encontrada", { extensions: { code: "NOT_FOUND" } });
      const input = args.input ?? {};
      let title = typeof input.title === "string" ? input.title.trim() : null;
      let synopsis = typeof input.synopsis === "string" ? input.synopsis.trim() : null;
      let genres = Array.isArray(input.genres) ? input.genres.map((item: unknown) => String(item).trim()).filter(Boolean) : null;
      if (title === work.title) title = null;
      if (synopsis === work.synopsis) synopsis = null;
      if (genres && JSON.stringify(genres) === JSON.stringify(work.genres)) genres = null;
      if (!title && !synopsis && !genres) badInput("Informe ao menos uma alteração sugerida");
      if (title !== null && (!title || title.length > 200)) badInput("O título deve ter até 200 caracteres");
      if (synopsis !== null && (!synopsis || synopsis.length > 10000)) badInput("A sinopse deve ter até 10.000 caracteres");
      if (genres && (genres.length > 30 || genres.some((item: string) => item.length > 50))) badInput("Revise a lista de gêneros");
      return AnimeEditSuggestion.create({
        animeId: medium === "ANIME" ? work._id : null,
        mangaId: medium === "MANGA" ? work._id : null,
        lightNovelId: medium === "LIGHT_NOVEL" ? work._id : null,
        medium,
        proposerId: user._id,
        title,
        synopsis,
        genres,
      });
    },
    reviewWorkEditSuggestion: async (_root, args, context: GraphQLContext) => {
      const reviewer = await requireZeus(context);
      const suggestion = await AnimeEditSuggestion.findOne({ _id: args.id, status: "PENDING" });
      if (!suggestion) throw new GraphQLError("Sugestão pendente não encontrada", { extensions: { code: "NOT_FOUND" } });
      if (args.approve) {
        const work = suggestion.lightNovelId
          ? await LightNovel.findById(suggestion.lightNovelId)
          : suggestion.mangaId
            ? await Manga.findById(suggestion.mangaId)
            : await Anime.findById(suggestion.animeId);
        if (!work) throw new GraphQLError("Obra não encontrada", { extensions: { code: "NOT_FOUND" } });
        if (suggestion.title) {
          work.title = suggestion.title;
          work.slug = animeSlugFromTitle(suggestion.title);
        }
        if (suggestion.synopsis) work.synopsis = suggestion.synopsis;
        if (suggestion.genres) work.genres = suggestion.genres;
        await work.save();
        await CatalogWork.findOneAndUpdate(
          { medium: suggestion.lightNovelId ? "LIGHT_NOVEL" : suggestion.mangaId ? "MANGA" : "ANIME", entityId: work._id },
          { title: work.title, slug: work.slug },
        );
        suggestion.status = "APPROVED";
      } else {
        suggestion.status = "REJECTED";
      }
      suggestion.reviewerId = reviewer._id;
      suggestion.reviewedAt = new Date();
      await suggestion.save();
      return suggestion;
    },
    updateAnime: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateAnimeSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const anime = await Anime.findOne({ slug });
      if (!anime) {
        throw new GraphQLError("Anime não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      try {
        const relatedIds = [...new Set(input.relatedWorks.map((item) => item.workId))];
        const existingRelatedWorks = await CatalogWork.countDocuments({ _id: { $in: relatedIds } });
        if (existingRelatedWorks !== relatedIds.length) badInput("Uma das obras relacionadas não existe mais");
        const personIds = [...new Set(input.staffCredits.map((credit) => credit.personId))];
        const existingPeople = await Person.countDocuments({ _id: { $in: personIds } });
        if (existingPeople !== personIds.length) badInput("Uma das pessoas vinculadas à staff não existe mais");
        const characterIds = [...new Set(input.characterCredits.map((credit) => credit.characterId))];
        const seiyuuIds = [...new Set(input.characterCredits.map((credit) => credit.seiyuuId))];
        const [existingCharacters, existingSeiyuus] = await Promise.all([
          Character.countDocuments({ _id: { $in: characterIds } }),
          Person.countDocuments({ _id: { $in: seiyuuIds }, roles: "SEIYUU" }),
        ]);
        if (existingCharacters !== characterIds.length) badInput("Um dos personagens vinculados não existe mais");
        if (existingSeiyuus !== seiyuuIds.length) badInput("Um dos seiyuus vinculados não existe mais");
        const artistIds = [...new Set(input.songCredits.flatMap((credit) => [credit.artistId, ...credit.featuredArtistIds]))];
        const existingArtists = await MusicArtist.countDocuments({ _id: { $in: artistIds } });
        if (existingArtists !== artistIds.length) badInput("Um dos artistas vinculados não existe mais");
        const studioIds = [...new Set(input.installments.flatMap((item) => item.studioId ? [item.studioId] : []))];
        const existingStudios = await Studio.countDocuments({ _id: { $in: studioIds } });
        if (existingStudios !== studioIds.length) badInput("Um dos estúdios vinculados não existe mais");

        const nextSlug = animeSlugFromTitle(input.title);
        anime.set({
          ...input,
          adultContent: input.adultContent || normalizeAnimeRating(input.rating) === "R18",
          slug: nextSlug,
          externalLinks: input.externalLinks ?? {},
          streamingLinks: input.streamingLinks ?? {},
          installments: input.installments.map(animeInstallmentValues),
        });
        await anime.save();

        await CatalogWork.findOneAndUpdate(
          { medium: "ANIME", entityId: anime._id },
          {
            title: anime.title,
            slug: anime.slug,
            coverUrl: anime.coverUrl,
            status: getOverallAnimeStatus(anime.installments),
            publicationStatus: anime.publicationStatus,
            adultContent: anime.adultContent,
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        return anime;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um anime cadastrado com este título", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    createManga: async (_root, args, context: GraphQLContext) => {
      const user = await requireZeus(context);
      const result = createMangaSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return createPublicationWork(Manga, "MANGA", "um manga", result.data.input, user);
    },
    updateManga: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateMangaSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return updatePublicationWork(Manga, "MANGA", "Manga", result.data.slug, result.data.input);
    },
    createLightNovel: async (_root, args, context: GraphQLContext) => {
      const user = await requireZeus(context);
      const result = createLightNovelSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return createPublicationWork(LightNovel, "LIGHT_NOVEL", "uma light novel", result.data.input, user);
    },
    updateLightNovel: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateLightNovelSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      return updatePublicationWork(LightNovel, "LIGHT_NOVEL", "Light novel", result.data.slug, result.data.input);
    },
    createMusicArtist: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createMusicArtistSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const input = result.data.input;
      try {
        return await MusicArtist.create({
          ...input,
          slug: animeSlugFromTitle(input.displayName),
          platformLinks: input.platformLinks ?? {},
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um artista cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateMusicArtist: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateMusicArtistSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const { slug, input } = result.data;
      const artist = await MusicArtist.findOne({ slug });
      if (!artist) {
        throw new GraphQLError("Artista não encontrado", { extensions: { code: "NOT_FOUND" } });
      }
      artist.set({ ...input, platformLinks: input.platformLinks ?? {} });
      await artist.save();
      return artist;
    },
    createStudio: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createStudioSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Studio.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.displayName) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe um estúdio cadastrado com este nome", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updateStudio: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateStudioSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const studio = await Studio.findOne({ slug: result.data.slug });
      if (!studio) throw new GraphQLError("Estúdio não encontrado", { extensions: { code: "NOT_FOUND" } });
      studio.set(result.data.input);
      await studio.save();
      return studio;
    },
    createPublisher: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createPublisherSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Publisher.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.displayName) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe uma editora cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updatePublisher: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updatePublisherSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const publisher = await Publisher.findOne({ slug: result.data.slug });
      if (!publisher) throw new GraphQLError("Editora não encontrada", { extensions: { code: "NOT_FOUND" } });
      publisher.set(result.data.input);
      await publisher.save();
      return publisher;
    },
    createMagazine: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createMagazineSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      if (!await Publisher.exists({ _id: result.data.input.publisherId })) badInput("A editora vinculada não existe mais");
      try {
        return await Magazine.create({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.title) });
      } catch (error: any) {
        if (error?.code === 11000) throw new GraphQLError("Já existe uma magazine cadastrada com este título", { extensions: { code: "CONFLICT" } });
        throw error;
      }
    },
    updateMagazine: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateMagazineSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      if (!await Publisher.exists({ _id: result.data.input.publisherId })) badInput("A editora vinculada não existe mais");
      const magazine = await Magazine.findOne({ slug: result.data.slug });
      if (!magazine) throw new GraphQLError("Magazine não encontrada", { extensions: { code: "NOT_FOUND" } });
      magazine.set({ ...result.data.input, slug: animeSlugFromTitle(result.data.input.title) });
      await magazine.save();
      return magazine;
    },
    createSeiyuu: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createSeiyuuSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        return await Person.create({
          ...input,
          slug: animeSlugFromTitle(input.displayName),
          roles: ["SEIYUU"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateSeiyuu: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateSeiyuuSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const person = await Person.findOne({ slug, roles: "SEIYUU" });
      if (!person) {
        throw new GraphQLError("Seiyuu não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      person.set({ ...input, roles: [...new Set([...(person.roles ?? []), "SEIYUU"])] });
      await person.save();
      return person;
    },
    createStaff: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Person.create({
          ...result.data.input,
          slug: animeSlugFromTitle(result.data.input.displayName),
          roles: ["STAFF"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    updateStaff: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const person = await Person.findOne({ slug: result.data.slug, roles: "STAFF" });
      if (!person) throw new GraphQLError("Profissional não encontrado", { extensions: { code: "NOT_FOUND" } });
      person.set({ ...result.data.input, roles: [...new Set([...(person.roles ?? []), "STAFF"])] });
      await person.save();
      return person;
    },
    createMangaka: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      try {
        return await Person.create({
          ...result.data.input,
          slug: animeSlugFromTitle(result.data.input.displayName),
          roles: ["MANGAKA"],
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe uma pessoa cadastrada com este nome", { extensions: { code: "CONFLICT" } });
        }
        throw error;
      }
    },
    updateMangaka: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateIndustryPersonSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const person = await Person.findOne({ slug: result.data.slug, roles: "MANGAKA" });
      if (!person) throw new GraphQLError("Mangaka não encontrado", { extensions: { code: "NOT_FOUND" } });
      person.set({
        ...result.data.input,
        roles: [...new Set([...(person.roles ?? []).filter((role) => role !== "STAFF"), "MANGAKA"])],
      });
      await person.save();
      return person;
    },
    createCharacter: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = createCharacterSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const input = result.data.input;
      try {
        return await Character.create({
          ...input,
          slug: animeSlugFromTitle(input.nameRomaji),
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um personagem cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    updateCharacter: async (_root, args, context: GraphQLContext) => {
      await requireZeus(context);
      const result = updateCharacterSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { slug, input } = result.data;
      const character = await Character.findOne({ slug });
      if (!character) {
        throw new GraphQLError("Personagem não encontrado", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      try {
        character.set({ ...input, slug: animeSlugFromTitle(input.nameRomaji) });
        await character.save();
        return character;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new GraphQLError("Já existe um personagem cadastrado com este nome", {
            extensions: { code: "CONFLICT" },
          });
        }
        throw error;
      }
    },
    saveAnimeListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = saveAnimeListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const anime = await Anime.findOne({ slug: result.data.animeSlug });
      if (!anime || anime.publicationStatus !== "PUBLISHED") badInput("Anime não encontrado");
      const installmentsByOrder = new Map(anime.installments.map((installment) => [installment.order, installment]));
      if (new Set(result.data.input.seasonProgress.map((item) => item.order)).size !== result.data.input.seasonProgress.length) {
        badInput("O progresso de uma temporada não pode ser repetido");
      }
      for (const progress of result.data.input.seasonProgress) {
        const installment = installmentsByOrder.get(progress.order);
        if (!installment || (installment.episodes > 0 && progress.watchedEpisodes > installment.episodes)) {
          badInput("Progresso de temporada inválido");
        }
      }

      return AnimeListEntry.findOneAndUpdate(
        { userId: user._id, animeId: anime._id },
        { ...result.data.input, userId: user._id, animeId: anime._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    },
    removeAnimeListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = removeAnimeListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const anime = await Anime.findOne({ slug: result.data.animeSlug }).select("_id");
      if (!anime) badInput("Anime não encontrado");

      const deletion = await AnimeListEntry.deleteOne({ userId: user._id, animeId: anime._id });
      return deletion.deletedCount > 0;
    },
    savePublicationListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = savePublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);

      const { medium, slug, input } = result.data;
      const work = await CatalogWork.findOne({ medium, slug, publicationStatus: "PUBLISHED" });
      if (!work) badInput("Obra não encontrada");
      const publication = medium === "MANGA"
        ? await Manga.findById(work.entityId).select("chapters")
        : await LightNovel.findById(work.entityId).select("chapters");
      if (!publication || (publication.chapters > 0 && input.readChapters > publication.chapters)) {
        badInput("Progresso de capítulos inválido");
      }

      return PublicationListEntry.findOneAndUpdate(
        { userId: user._id, workId: work._id },
        { ...input, userId: user._id, workId: work._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    },
    removePublicationListEntry: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = removePublicationListEntrySchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        medium: result.data.medium,
        slug: result.data.slug,
      }).select("_id");
      if (!work) badInput("Obra não encontrada");
      const deletion = await PublicationListEntry.deleteOne({ userId: user._id, workId: work._id });
      return deletion.deletedCount > 0;
    },
    setWorkFavorite: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = workReviewTargetSchema.safeParse(args);
      if (!result.success) badInput("Obra inválida");
      const work = await CatalogWork.findOne({
        ...result.data,
        publicationStatus: "PUBLISHED",
      }).select("_id");
      if (!work) badInput("Obra não encontrada");

      if (args.favorite) {
        await WorkFavorite.findOneAndUpdate(
          { userId: user._id, workId: work._id },
          { userId: user._id, workId: work._id },
          { upsert: true, setDefaultsOnInsert: true },
        );
        return true;
      }

      await WorkFavorite.deleteOne({ userId: user._id, workId: work._id });
      return false;
    },
    saveWorkReview: async (_root, args, context: GraphQLContext) => {
      const user = await currentUser(context);
      if (!user) unauthenticated();
      const result = saveWorkReviewSchema.safeParse(args);
      if (!result.success) badInput(result.error.issues[0]?.message);
      const { medium, slug, input } = result.data;
      const work = await CatalogWork.findOne({ medium, slug, publicationStatus: "PUBLISHED" }).select("_id");
      if (!work) badInput("Obra não encontrada");
      return WorkReview.findOneAndUpdate(
        { userId: user._id, workId: work._id },
        { ...input, userId: user._id, workId: work._id },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    },
  },
};
