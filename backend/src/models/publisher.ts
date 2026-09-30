import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface PublisherDocument {
  displayName: string;
  slug: string;
  imageUrl: string;
  description: string | null;
  foundation: string | null;
  headquarters: string | null;
  externalLinks: Record<string, string | undefined>;
  publicationStatus: "DRAFT" | "PUBLISHED";
  createdAt: Date;
  updatedAt: Date;
}

const publisherSchema = new Schema<PublisherDocument>({
  displayName: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
  imageUrl: { type: String, required: true, trim: true, maxlength: 2_048 },
  description: { type: String, trim: true, default: null, maxlength: 10_000 },
  foundation: { type: String, trim: true, default: null, maxlength: 100 },
  headquarters: { type: String, trim: true, default: null, maxlength: 200 },
  externalLinks: {
    website: { type: String, trim: true, default: undefined },
    x: { type: String, trim: true, default: undefined },
    instagram: { type: String, trim: true, default: undefined },
    pixiv: { type: String, trim: true, default: undefined },
    youtube: { type: String, trim: true, default: undefined },
  },
  publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", required: true },
}, { timestamps: true, versionKey: false });

publisherSchema.index({ publicationStatus: 1, displayName: 1 });

export const Publisher = (models.Publisher as Model<PublisherDocument> | undefined) ?? model<PublisherDocument>("Publisher", publisherSchema);
