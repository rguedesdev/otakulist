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
  publicationStatus: { type: String, enum: ANIME_PUBLICATION_STATUSES, default: "DRAFT", required: true },
}, { timestamps: true, versionKey: false });

magazineSchema.index({ publisherId: 1, publicationStatus: 1, title: 1 });

export const Magazine = (models.Magazine as Model<MagazineDocument> | undefined) ?? model<MagazineDocument>("Magazine", magazineSchema);
