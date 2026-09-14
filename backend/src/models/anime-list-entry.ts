import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const ANIME_LIST_STATUSES = ["PLANNED", "WATCHING", "PAUSED", "COMPLETED", "DROPPED"] as const;

export interface AnimeListEntryDocument {
  userId: mongoose.Types.ObjectId;
  animeId: mongoose.Types.ObjectId;
  status: (typeof ANIME_LIST_STATUSES)[number];
  score: number | null;
  seasonProgress: Array<{ order: number; watchedEpisodes: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const animeListEntrySchema = new Schema<AnimeListEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    animeId: { type: Schema.Types.ObjectId, ref: "Anime", required: true },
    status: { type: String, enum: ANIME_LIST_STATUSES, required: true, default: "PLANNED" },
    score: { type: Number, min: 1, max: 10, default: null },
    seasonProgress: [new Schema({
      order: { type: Number, required: true, min: 1 },
      watchedEpisodes: { type: Number, required: true, min: 0, default: 0 },
    }, { _id: false })],
  },
  { timestamps: true, versionKey: false },
);

animeListEntrySchema.index({ userId: 1, animeId: 1 }, { unique: true });
animeListEntrySchema.index({ userId: 1, updatedAt: -1 });

export const AnimeListEntry =
  (models.AnimeListEntry as Model<AnimeListEntryDocument> | undefined) ??
  model<AnimeListEntryDocument>("AnimeListEntry", animeListEntrySchema);
