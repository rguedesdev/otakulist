import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface WorkFavoriteDocument {
  userId: mongoose.Types.ObjectId;
  workId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workFavoriteSchema = new Schema<WorkFavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workId: { type: Schema.Types.ObjectId, ref: "CatalogWork", required: true },
  },
  { timestamps: true, versionKey: false },
);

workFavoriteSchema.index({ userId: 1, workId: 1 }, { unique: true });
workFavoriteSchema.index({ userId: 1, createdAt: -1 });

export const WorkFavorite =
  (models.WorkFavorite as Model<WorkFavoriteDocument> | undefined)
  ?? model<WorkFavoriteDocument>("WorkFavorite", workFavoriteSchema);
