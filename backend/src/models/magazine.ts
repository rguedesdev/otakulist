import mongoose, { type Model } from "mongoose";

import { ANIME_PUBLICATION_STATUSES } from "./anime.js";

const { Schema, model, models } = mongoose;

export interface MagazineDocument {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  foundation: string | null;
  publisherId: mongoose.Types.ObjectId;
  demography: string | null;
  frequency: string | null;
  externalLinks: Record<string, string | undefined>;
  storeLinks: Record<string, string | undefined>;
  publicationStatus: (typeof ANIME_PUBLICATION_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const magazineSchema = new Schema<MagazineDocument>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
  description: { type: String, required: true, trim: true, maxlength: 10_000 },
  imageUrl: { type: String, required: true, trim: true, maxlength: 2_048 },
  foundation: { type: String, trim: true, default: null, maxlength: 100 },
  publisherId: { type: Schema.Types.ObjectId, ref: "Publisher", required: true },
  demography: { type: String, trim: true, default: null, maxlength: 100 },
  frequency: { type: String, trim: true, default: null, maxlength: 100 },
  externalLinks: {
    website: { type: String, trim: true, default: undefined },
    x: { type: String, trim: true, default: undefined },
    instagram: { type: String, trim: true, default: undefined },
    pixiv: { type: String, trim: true, default: undefined },
    youtube: { type: String, trim: true, default: undefined },
      tiktok: { type: String, trim: true, default: undefined },
  },
  storeLinks: {
    amazon: { type: String, trim: true, default: undefined },
    cdJapan: { type: String, trim: true, default: undefined },
    mercadoLivre: { type: String, trim: true, default: undefined },
    rakuten: { type: String, trim: true, default: undefined },
    shopee: { type: String, trim: true, default: undefined },
    ebay: { type: String, trim: true, default: undefined },
    otakuyasan: { type: String, trim: true, default: undefined },
    hmv: { type: String, trim: true, default: undefined },
    honto: { type: String, trim: true, default: undefined },
    toranoana: { type: String, trim: true, default: undefined },
    animate: { type: String, trim: true, default: undefined },
  },
  publicationStatus: { type: String, enum: ANIME_PUBLICATION_STATUSES, default: "DRAFT", required: true },
}, { timestamps: true, versionKey: false });

magazineSchema.index({ publisherId: 1, publicationStatus: 1, title: 1 });

export const Magazine = (models.Magazine as Model<MagazineDocument> | undefined) ?? model<MagazineDocument>("Magazine", magazineSchema);
