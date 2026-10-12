export const animeTypeDefs = /* GraphQL */ `enum AnimePublicationStatus { DRAFT PUBLISHED }

enum AnimeReleaseFormat { TV MOVIE OVA ONA SPECIAL }

enum AnimeStatus { ANNOUNCED AIRING FINISHED CANCELLED }

enum AnimeSeason { WINTER SPRING SUMMER FALL }

enum AnimeBroadcastDay { SUNDAY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY }

enum AnimeSongType { OPENING ENDING INSERT }

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

type AnimeSeasonProgress { order: Int! watchedEpisodes: Int! }

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

extend type Query {
    anime(slug: String!, includeAdult: Boolean = false): Anime
    dailyFeaturedAnime(includeAdult: Boolean = false): Anime
    seasonalAnime(season: AnimeSeason!, year: Int!, limit: Int, includeAdult: Boolean = false, deduplicate: Boolean = true): [SeasonalAnime!]!
    adminAnimes(query: String): [Anime!]!
    pendingWorkEditSuggestions: [WorkEditSuggestion!]!
  }

extend type Mutation {
    createAnime(input: CreateAnimeInput!): Anime!
    updateAnime(slug: String!, input: CreateAnimeInput!): Anime!
    suggestWorkEdit(medium: WorkMedium!, slug: String!, input: WorkEditSuggestionInput!): WorkEditSuggestion!
    reviewWorkEditSuggestion(id: ID!, approve: Boolean!): WorkEditSuggestion!
  }`;
