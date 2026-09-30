import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const ANIME_RELEASE_FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"] as const;
export const ANIME_STATUSES = ["ANNOUNCED", "AIRING", "FINISHED", "CANCELLED"] as const;
export const ANIME_BROADCAST_DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
export const ANIME_PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export const ANIME_SONG_TYPES = ["OPENING", "ENDING", "INSERT"] as const;
export const ALTERNATIVE_TITLE_TYPES = [
  "JAPANESE",
  "ROMAJI",
  "ENGLISH",
  "PORTUGUESE",
  "LITERAL",
  "OTHER",
] as const;
export const RELATED_WORK_TYPES = [
  "ADAPTATION",
  "ALTERNATIVE_VERSION",
  "CHARACTER",
  "OTHER",
  "PARENT_STORY",
  "SOURCE_MATERIAL",
  "SIDE_STORY",
  "SPIN_OFF",
] as const;

export interface AnimeDocument {
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  alternativeTitles: Array<{ type: string; title: string }>;
  genres: string[];
  producers: string[];
  demography: string | null;
  rating: string | null;
  adultContent: boolean;
  publicationStatus: (typeof ANIME_PUBLICATION_STATUSES)[number];
  installments: Array<{
    order: number;
    title: string;
    label: string;
    format: (typeof ANIME_RELEASE_FORMATS)[number];
    synopsis: string;
    coverUrl: string | null;
    episodes: number;
    durationMinutes: number | null;
    status: (typeof ANIME_STATUSES)[number];
    statusOverride: (typeof ANIME_STATUSES)[number] | null;
    startDate: Date | null;
    endDate: Date | null;
    broadcastSeason: string | null;
    broadcastDay: (typeof ANIME_BROADCAST_DAYS)[number] | null;
    broadcastTime: string | null;
    studio: string | null;
    studioId: mongoose.Types.ObjectId | null;
  }>;
  characterCredits: Array<{
    characterId: mongoose.Types.ObjectId;
    seiyuuId: mongoose.Types.ObjectId;
  }>;
  songCredits: Array<{
    artistId: mongoose.Types.ObjectId;
    songTitle: string;
    featuredArtistIds: mongoose.Types.ObjectId[];
    type: (typeof ANIME_SONG_TYPES)[number];
    sequence: number | null;
    episodeRange: string | null;
  }>;
  staffCredits: Array<{ personId: mongoose.Types.ObjectId; role: string; contribution: string | null }>;
  relatedWorks: Array<{
    relationType: (typeof RELATED_WORK_TYPES)[number];
    workId: mongoose.Types.ObjectId;
  }>;
  externalLinks: Record<string, string | undefined>;
  streamingLinks: Record<string, string | undefined>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const optionalUrl = { type: String, trim: true, default: undefined } as const;

const animeSchema = new Schema<AnimeDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    synopsis: { type: String, required: true, trim: true, maxlength: 10_000 },
    coverUrl: { type: String, required: true, trim: true },
    alternativeTitles: [
      new Schema(
        {
          type: { type: String, enum: ALTERNATIVE_TITLE_TYPES, required: true },
          title: { type: String, required: true, trim: true, maxlength: 200 },
        },
        { _id: false },
      ),
    ],
    genres: [{ type: String, trim: true }],
    producers: [{ type: String, trim: true }],
    demography: { type: String, trim: true, default: null },
    rating: { type: String, trim: true, default: null },
    adultContent: { type: Boolean, default: false, required: true },
    publicationStatus: { type: String, enum: ANIME_PUBLICATION_STATUSES, default: "DRAFT", required: true },
    installments: [
      new Schema(
        {
          order: { type: Number, required: true, min: 1 },
          title: { type: String, required: true, trim: true, maxlength: 200 },
          label: { type: String, required: true, trim: true, maxlength: 100 },
          format: { type: String, enum: ANIME_RELEASE_FORMATS, required: true },
          synopsis: { type: String, required: true, trim: true, maxlength: 10_000 },
          coverUrl: { type: String, trim: true, default: null },
          episodes: { type: Number, required: true, min: 0 },
          durationMinutes: { type: Number, min: 1, default: null },
          status: { type: String, enum: ANIME_STATUSES, required: true },
          statusOverride: { type: String, enum: ANIME_STATUSES, default: null },
          startDate: { type: Date, default: null },
          endDate: { type: Date, default: null },
          broadcastSeason: { type: String, trim: true, default: null },
          broadcastDay: { type: String, enum: ANIME_BROADCAST_DAYS, default: null },
          broadcastTime: { type: String, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/, default: null },
          studio: { type: String, trim: true, default: null },
          studioId: { type: Schema.Types.ObjectId, ref: "Studio", default: null },
        },
        { _id: true },
      ),
    ],
    characterCredits: [
      new Schema(
        {
          characterId: { type: Schema.Types.ObjectId, ref: "Character", required: true },
          seiyuuId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
        },
        { _id: false },
      ),
    ],
    songCredits: [
      new Schema(
        {
          artistId: { type: Schema.Types.ObjectId, ref: "MusicArtist", required: true },
          songTitle: { type: String, required: true, trim: true, maxlength: 300 },
          featuredArtistIds: [{ type: Schema.Types.ObjectId, ref: "MusicArtist" }],
          type: { type: String, enum: ANIME_SONG_TYPES, required: true },
          sequence: { type: Number, min: 1, default: null },
          episodeRange: { type: String, trim: true, default: null, maxlength: 100 },
        },
        { _id: false },
      ),
    ],
    staffCredits: [
      new Schema(
        {
          personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
          role: { type: String, required: true, trim: true, maxlength: 200 },
          contribution: { type: String, trim: true, default: null, maxlength: 200 },
        },
        { _id: false },
      ),
    ],
    relatedWorks: [
      new Schema(
        {
          relationType: { type: String, enum: RELATED_WORK_TYPES, required: true },
          workId: { type: Schema.Types.ObjectId, ref: "CatalogWork", required: true },
        },
        { _id: true },
      ),
    ],
    externalLinks: {
      website: optionalUrl,
      x: optionalUrl,
      instagram: optionalUrl,
      pixiv: optionalUrl,
      youtube: optionalUrl,
    },
    streamingLinks: {
      crunchyroll: optionalUrl,
      netflix: optionalUrl,
      primeVideo: optionalUrl,
      bilibili: optionalUrl,
      retrocrush: optionalUrl,
      hulu: optionalUrl,
      hidive: optionalUrl,
      uNext: optionalUrl,
      abemaTv: optionalUrl,
      adn: optionalUrl,
      museAsia: optionalUrl,
      laftel: optionalUrl,
      tver: optionalUrl,
      iqiyi: optionalUrl,
      tubi: optionalUrl,
      dAnimeStore: optionalUrl,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  },
  { timestamps: true, versionKey: false },
);

animeSchema.index({ publicationStatus: 1, title: 1 });
animeSchema.index({ publicationStatus: 1, "installments.startDate": 1 });
animeSchema.index({ publicationStatus: 1, "installments.broadcastSeason": 1 });

export const Anime =
  (models.Anime as Model<AnimeDocument> | undefined) ?? model<AnimeDocument>("Anime", animeSchema);
