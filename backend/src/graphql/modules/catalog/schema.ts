export const catalogTypeDefs = /* GraphQL */ `enum AlternativeTitleType { JAPANESE ROMAJI ENGLISH PORTUGUESE LITERAL SYNONYM OTHER }

enum RelatedWorkType { ADAPTATION ALTERNATIVE_VERSION CHARACTER OTHER PARENT_STORY REMAKE SIDE_STORY SOURCE_MATERIAL SPIN_OFF }

enum WorkMedium { ANIME MANGA LIGHT_NOVEL }

type TopRatedWork {
    title: String!
    slug: String!
    medium: WorkMedium!
    coverUrl: String!
    score: Float!
    ratingCount: Int!
  }

type CatalogRankingWork {
    title: String!
    slug: String!
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

type AlternativeTitle { type: AlternativeTitleType! title: String! }

type PersonAnimeCredit { anime: PersonAnime! role: String! contribution: String }

type PersonAnime { id: ID! title: String! slug: String! coverUrl: String! startDate: String endDate: String }

type PersonMangaCredit { manga: PersonManga! role: String! contribution: String }

type PersonManga { id: ID! title: String! slug: String! coverUrl: String! startDate: String endDate: String }

type RelatedWork {
    id: ID!
    relationType: RelatedWorkType
    title: String!
    slug: String!
    href: String!
    coverUrl: String!
    medium: String!
    status: String!
  }

type WorkSearchResult { id: ID! title: String! slug: String! medium: WorkMedium! coverUrl: String! status: String! href: String! }

type ExternalLinks { website: String x: String instagram: String pixiv: String youtube: String tiktok: String }

type StreamingLinks {
    crunchyroll: String netflix: String primeVideo: String bilibili: String retrocrush: String
    hulu: String hidive: String uNext: String abemaTv: String adn: String museAsia: String
    laftel: String tver: String iqiyi: String tubi: String dAnimeStore: String
  }

type MusicPlatformLinks { spotify: String tidal: String deezer: String amazonMusic: String }

type SeasonalAnime {
    anime: Anime!
    installment: AnimeInstallment!
  }

input AlternativeTitleInput { type: AlternativeTitleType! title: String! }

input RelatedWorkInput {
    relationType: RelatedWorkType
    workId: ID!
  }

input ExternalLinksInput { website: String x: String instagram: String pixiv: String youtube: String tiktok: String }

input StreamingLinksInput {
    crunchyroll: String netflix: String primeVideo: String bilibili: String retrocrush: String
    hulu: String hidive: String uNext: String abemaTv: String adn: String museAsia: String
    laftel: String tver: String iqiyi: String tubi: String dAnimeStore: String
  }

extend type Query {
    searchWorks(query: String!, medium: WorkMedium, includeAdult: Boolean = false): [WorkSearchResult!]!
    topRatedWorks(medium: WorkMedium, limit: Int = 5, includeAdult: Boolean = false): [TopRatedWork!]!
    catalogRankingWorks(medium: WorkMedium!, includeAdult: Boolean = false): [CatalogRankingWork!]!
    discoveryWorks(includeAdult: Boolean = false): [DiscoveryWork!]!
  }`;
