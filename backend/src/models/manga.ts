import mongoose, { type Model } from "mongoose";

import { ALTERNATIVE_TITLE_TYPES, ANIME_PUBLICATION_STATUSES, RELATED_WORK_TYPES } from "./anime.js";

const { Schema, model, models } = mongoose;

export const MANGA_STATUSES = ["ANNOUNCED", "PUBLISHING", "HIATUS", "FINISHED", "CANCELLED"] as const;

export interface MangaDocument {
  title: string;
  slug: string;
  synopsis: string;
  coverUrl: string;
  alternativeTitles: Array<{ type: string; title: string }>;
  status: (typeof MANGA_STATUSES)[number];
  publicationStatus: (typeof ANIME_PUBLICATION_STATUSES)[number];
  startDate: Date | null;
  endDate: Date | null;
  magazine: string | null;
  magazineId: mongoose.Types.ObjectId | null;
  publisherId: mongoose.Types.ObjectId | null;
  publisher: string | null;
  demography: string | null;
  genres: string[];
  chapters: number;
  volumes: number;
  serialization: string | null;
  externalLinks: Record<string, string | undefined>;
  storeLinks: Record<string, string | undefined>;
  characterIds: mongoose.Types.ObjectId[];
  staffCredits: Array<{ personId: mongoose.Types.ObjectId; role: string; contribution: string | null }>;
  relatedWorks: Array<{ relationType: (typeof RELATED_WORK_TYPES)[number]; workId: mongoose.Types.ObjectId }>;
  createdBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const optionalUrl = { type: String, trim: true, default: undefined } as const;
const mangaSchema = new Schema<MangaDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    synopsis: { type: String, required: true, trim: true, maxlength: 10_000 },
    coverUrl: { type: String, required: true, trim: true },
    alternativeTitles: [new Schema({ type: { type: String, enum: ALTERNATIVE_TITLE_TYPES, required: true }, title: { type: String, required: true, trim: true, maxlength: 200 } }, { _id: false })],
    status: { type: String, enum: MANGA_STATUSES, required: true },
    publicationStatus: { type: String, enum: ANIME_PUBLICATION_STATUSES, required: true, default: "DRAFT" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    magazine: { type: String, trim: true, default: null },
    magazineId: { type: Schema.Types.ObjectId, ref: "Magazine", default: null },
    publisherId: { type: Schema.Types.ObjectId, ref: "Publisher", default: null },
    publisher: { type: String, trim: true, default: null },
    demography: { type: String, trim: true, default: null },
    genres: [{ type: String, trim: true }],
    chapters: { type: Number, required: true, min: 0 },
    volumes: { type: Number, required: true, min: 0 },
    serialization: { type: String, trim: true, default: null },
    externalLinks: { website: optionalUrl, x: optionalUrl, instagram: optionalUrl, pixiv: optionalUrl, youtube: optionalUrl },
    storeLinks: {
      amazon: optionalUrl, cdJapan: optionalUrl, mercadoLivre: optionalUrl, rakuten: optionalUrl,
      shopee: optionalUrl, ebay: optionalUrl, otakuyasan: optionalUrl, hmv: optionalUrl,
      honto: optionalUrl, toranoana: optionalUrl, animate: optionalUrl,
    },
    characterIds: [{ type: Schema.Types.ObjectId, ref: "Character" }],
    staffCredits: [new Schema({ personId: { type: Schema.Types.ObjectId, ref: "Person", required: true }, role: { type: String, required: true, trim: true }, contribution: { type: String, trim: true, default: null } }, { _id: false })],
    relatedWorks: [new Schema({ relationType: { type: String, enum: RELATED_WORK_TYPES, required: true }, workId: { type: Schema.Types.ObjectId, ref: "CatalogWork", required: true } }, { _id: false })],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const Manga = (models.Manga as Model<MangaDocument> | undefined) ?? model<MangaDocument>("Manga", mangaSchema);
