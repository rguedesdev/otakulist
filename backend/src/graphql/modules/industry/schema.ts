export const industryTypeDefs = /* GraphQL */ `enum MusicArtistKind { SOLO BAND }

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
    externalLinks: ExternalLinks!
    publicationStatus: AnimePublicationStatus!
    animeSongs: [MusicArtistAnimeSong!]!
    createdAt: String!
    updatedAt: String!
  }

type CharacterVoiceCredit {
    seiyuuSlug: String!
    animeTitle: String!
    seiyuu: IndustryPerson
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
    externalLinks: ExternalLinksInput
    publicationStatus: AnimePublicationStatus! = DRAFT
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

extend type Query {
    character(slug: String!): Character
    seiyuu(slug: String!): IndustryPerson
    staff(slug: String!): IndustryPerson
    mangaka(slug: String!): IndustryPerson
    musicArtist(slug: String!): MusicArtist
    studio(slug: String!): Studio
    publisher(slug: String!): Publisher
    magazine(slug: String!): Magazine
    charactersBySeiyuu(slug: String!): [Character!]!
    searchPeople(query: String!): [IndustryPerson!]!
    searchStudios(query: String!): [Studio!]!
    searchPublishers(query: String!): [Publisher!]!
    searchMagazines(query: String!): [Magazine!]!
    adminCharacters(query: String): [Character!]!
    adminSeiyuus(query: String): [IndustryPerson!]!
    adminStaff(query: String): [IndustryPerson!]!
    adminMangakas(query: String): [IndustryPerson!]!
    adminMusicArtists(query: String): [MusicArtist!]!
    adminStudios(query: String): [Studio!]!
    adminPublishers(query: String): [Publisher!]!
    adminMagazines(query: String): [Magazine!]!
  }

extend type Mutation {
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
  }`;
