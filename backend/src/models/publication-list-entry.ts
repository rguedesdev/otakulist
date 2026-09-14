import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const PUBLICATION_LIST_STATUSES = ["PLANNED", "READING", "PAUSED", "COMPLETED", "DROPPED"] as const;

export interface PublicationListEntryDocument {
  userId: mongoose.Types.ObjectId;
  workId: mongoose.Types.ObjectId;
  status: (typeof PUBLICATION_LIST_STATUSES)[number];
  readChapters: number;
  createdAt: Date;
  updatedAt: Date;
}

const publicationListEntrySchema = new Schema<PublicationListEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workId: { type: Schema.Types.ObjectId, ref: "CatalogWork", required: true },
    status: { type: String, enum: PUBLICATION_LIST_STATUSES, required: true, default: "PLANNED" },
    readChapters: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

publicationListEntrySchema.index({ userId: 1, workId: 1 }, { unique: true });
publicationListEntrySchema.index({ userId: 1, updatedAt: -1 });

export const PublicationListEntry =
  (models.PublicationListEntry as Model<PublicationListEntryDocument> | undefined) ??
  model<PublicationListEntryDocument>("PublicationListEntry", publicationListEntrySchema);
