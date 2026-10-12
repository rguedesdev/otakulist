export const communityTypeDefs = /* GraphQL */ `enum AnimeListStatus { PLANNED WATCHING PAUSED COMPLETED DROPPED }

enum PublicationListStatus { PLANNED READING PAUSED COMPLETED DROPPED }

type WorkReview { score: Float! comment: String updatedAt: String! }

type PublicWorkReview { id: ID! score: Float! comment: String! updatedAt: String! author: PublicUser! }

type ReviewSummary { average: Float! count: Int! }

type UserFavorite {
    id: ID!
    createdAt: String!
    work: WorkSearchResult!
  }

input SaveWorkReviewInput { score: Float! comment: String }

type UserWorkReview { id: ID! score: Float! updatedAt: String! work: WorkSearchResult! }

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

extend type Query {
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

extend type Mutation {
    saveAnimeListEntry(animeSlug: String!, input: SaveAnimeListEntryInput!): AnimeListEntry!
    removeAnimeListEntry(animeSlug: String!): Boolean!
    savePublicationListEntry(medium: WorkMedium!, slug: String!, input: SavePublicationListEntryInput!): PublicationListEntry!
    removePublicationListEntry(medium: WorkMedium!, slug: String!): Boolean!
    setWorkFavorite(medium: WorkMedium!, slug: String!, favorite: Boolean!): Boolean!
    saveWorkReview(medium: WorkMedium!, slug: String!, input: SaveWorkReviewInput!): WorkReview!
  }`;
