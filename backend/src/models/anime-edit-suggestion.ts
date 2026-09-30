import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface AnimeEditSuggestionDocument {
  animeId: mongoose.Types.ObjectId | null;
  mangaId: mongoose.Types.ObjectId | null;
  lightNovelId: mongoose.Types.ObjectId | null;
  medium: "ANIME" | "MANGA" | "LIGHT_NOVEL";
  proposerId: mongoose.Types.ObjectId;
  title: string | null;
  synopsis: string | null;
  genres: string[] | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerId: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const animeEditSuggestionSchema = new Schema<AnimeEditSuggestionDocument>(
  {
    animeId: { type: Schema.Types.ObjectId, ref: "Anime", default: null, index: true },
    mangaId: { type: Schema.Types.ObjectId, ref: "Manga", default: null, index: true },
    lightNovelId: { type: Schema.Types.ObjectId, ref: "LightNovel", default: null, index: true },
    medium: { type: String, enum: ["ANIME", "MANGA", "LIGHT_NOVEL"], required: true, default: "ANIME" },
    proposerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true, maxlength: 200, default: null },
    synopsis: { type: String, trim: true, maxlength: 10_000, default: null },
    genres: { type: [String], default: null },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

animeEditSuggestionSchema.index({ status: 1, createdAt: 1 });

export const AnimeEditSuggestion =
  (models.AnimeEditSuggestion as Model<AnimeEditSuggestionDocument> | undefined)
  ?? model<AnimeEditSuggestionDocument>("AnimeEditSuggestion", animeEditSuggestionSchema);
