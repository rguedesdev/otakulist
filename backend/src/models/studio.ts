import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface StudioDocument {
  displayName: string;
  slug: string;
  nameKanji: string | null;
  imageUrl: string;
  description: string | null;
  foundation: string | null;
  headquarters: string | null;
  website: string | null;
  publicationStatus: "DRAFT" | "PUBLISHED";
  createdAt: Date;
  updatedAt: Date;
}

const studioSchema = new Schema<StudioDocument>({
  displayName: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
  nameKanji: { type: String, trim: true, default: null, maxlength: 200 },
  imageUrl: { type: String, required: true, trim: true, maxlength: 2_048 },
  description: { type: String, trim: true, default: null, maxlength: 10_000 },
  foundation: { type: String, trim: true, default: null, maxlength: 100 },
  headquarters: { type: String, trim: true, default: null, maxlength: 200 },
  website: { type: String, trim: true, default: null, maxlength: 2_048 },
  publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", required: true },
}, { timestamps: true, versionKey: false });

studioSchema.index({ publicationStatus: 1, displayName: 1 });

export const Studio = (models.Studio as Model<StudioDocument> | undefined) ?? model<StudioDocument>("Studio", studioSchema);
