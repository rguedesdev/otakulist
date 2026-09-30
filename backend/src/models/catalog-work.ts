import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const WORK_MEDIA = ["ANIME", "MANGA", "LIGHT_NOVEL"] as const;
export type WorkMedium = (typeof WORK_MEDIA)[number];

export interface CatalogWorkDocument {
  title: string;
  slug: string;
  medium: WorkMedium;
  coverUrl: string;
  status: string;
  publicationStatus: "DRAFT" | "PUBLISHED";
  adultContent: boolean;
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const catalogWorkSchema = new Schema<CatalogWorkDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 220 },
    medium: { type: String, enum: WORK_MEDIA, required: true },
    coverUrl: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED"], required: true, default: "DRAFT" },
    adultContent: { type: Boolean, default: false, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, versionKey: false },
);

catalogWorkSchema.index({ medium: 1, slug: 1 }, { unique: true });
catalogWorkSchema.index({ title: "text" });

export const CatalogWork =
  (models.CatalogWork as Model<CatalogWorkDocument> | undefined) ??
  model<CatalogWorkDocument>("CatalogWork", catalogWorkSchema);
