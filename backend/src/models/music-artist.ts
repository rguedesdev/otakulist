import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const MUSIC_ARTIST_KINDS = ["SOLO", "BAND"] as const;
export const MUSIC_ARTIST_PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export interface MusicArtistDocument {
  displayName: string;
  slug: string;
  kind: (typeof MUSIC_ARTIST_KINDS)[number];
  nameKanji: string | null;
  imageUrl: string;
  description: string | null;
  origin: string | null;
  dateOfBirth: string | null;
  activityPeriod: string | null;
  recordLabel: string | null;
  genres: string[];
  discography: Array<{
    title: string;
    releaseType: string;
    year: string;
    tracks: number;
    cover: string;
  }>;
  platformLinks: Record<string, string | undefined>;
  externalLinks: Record<string, string | undefined>;
  publicationStatus: (typeof MUSIC_ARTIST_PUBLICATION_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const optionalUrl = { type: String, trim: true, default: undefined } as const;

const musicArtistSchema = new Schema<MusicArtistDocument>(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    kind: { type: String, enum: MUSIC_ARTIST_KINDS, required: true },
    nameKanji: { type: String, trim: true, default: null, maxlength: 200 },
    imageUrl: { type: String, required: true, trim: true, maxlength: 2_048 },
    description: { type: String, trim: true, default: null, maxlength: 10_000 },
    origin: { type: String, trim: true, default: null, maxlength: 200 },
    dateOfBirth: { type: String, trim: true, default: null, maxlength: 100 },
    activityPeriod: { type: String, trim: true, default: null, maxlength: 100 },
    recordLabel: { type: String, trim: true, default: null, maxlength: 200 },
    genres: [{ type: String, trim: true, maxlength: 100 }],
    discography: [{
      title: { type: String, required: true, trim: true, maxlength: 200 },
      releaseType: { type: String, required: true, trim: true, maxlength: 100 },
      year: { type: String, required: true, trim: true, maxlength: 20 },
      tracks: { type: Number, required: true, min: 0, max: 10_000 },
      cover: { type: String, required: true, trim: true, maxlength: 2_048 },
      _id: false,
    }],
    platformLinks: {
      spotify: optionalUrl,
      tidal: optionalUrl,
      deezer: optionalUrl,
      amazonMusic: optionalUrl,
    },
    externalLinks: {
      website: optionalUrl,
      x: optionalUrl,
      instagram: optionalUrl,
      pixiv: optionalUrl,
      youtube: optionalUrl,
      tiktok: optionalUrl,
    },
    publicationStatus: {
      type: String,
      enum: MUSIC_ARTIST_PUBLICATION_STATUSES,
      default: "DRAFT",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

musicArtistSchema.index({ publicationStatus: 1, displayName: 1 });

export const MusicArtist =
  (models.MusicArtist as Model<MusicArtistDocument> | undefined) ??
  model<MusicArtistDocument>("MusicArtist", musicArtistSchema);
