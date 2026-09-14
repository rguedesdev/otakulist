import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface WorkReviewDocument {
  userId: mongoose.Types.ObjectId;
  workId: mongoose.Types.ObjectId;
  score: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const workReviewSchema = new Schema<WorkReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workId: { type: Schema.Types.ObjectId, ref: "CatalogWork", required: true },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: (value: number) => Number.isInteger(value * 10),
        message: "Use no máximo uma casa decimal na nota",
      },
    },
    comment: { type: String, trim: true, maxlength: 2_000, default: null },
  },
  { timestamps: true, versionKey: false },
);

workReviewSchema.index({ userId: 1, workId: 1 }, { unique: true });
workReviewSchema.index({ workId: 1, updatedAt: -1 });

export const WorkReview =
  (models.WorkReview as Model<WorkReviewDocument> | undefined) ??
  model<WorkReviewDocument>("WorkReview", workReviewSchema);
