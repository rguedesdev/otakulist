export const publicationTypeDefs = /* GraphQL */ `type StoreLinks {
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

extend type Query {
    manga(slug: String!, includeAdult: Boolean = false): Manga
    dailyMangaRecommendation(includeAdult: Boolean = false): Manga
    recentPublishingMangas(limit: Int = 5, includeAdult: Boolean = false): [Manga!]!
    browseMangas(includeAdult: Boolean = false): [Manga!]!
    lightNovel(slug: String!, includeAdult: Boolean = false): LightNovel
    publishingLightNovelSpotlight(includeAdult: Boolean = false): LightNovel
    dailyLightNovelRecommendation(includeAdult: Boolean = false): LightNovel
    recentPublishingLightNovels(limit: Int = 5, includeAdult: Boolean = false): [LightNovel!]!
    browseLightNovels(includeAdult: Boolean = false): [LightNovel!]!
    adminMangas(query: String): [Manga!]!
    adminLightNovels(query: String): [LightNovel!]!
  }

extend type Mutation {
    createManga(input: CreateMangaInput!): Manga!
    updateManga(slug: String!, input: CreateMangaInput!): Manga!
    createLightNovel(input: CreateLightNovelInput!): LightNovel!
    updateLightNovel(slug: String!, input: CreateLightNovelInput!): LightNovel!
  }`;
