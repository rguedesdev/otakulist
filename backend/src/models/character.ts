import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const CHARACTER_PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export interface CharacterDocument {
  nameRomaji: string;
  slug: string;
  nameKanji: string | null;
  description: string | null;
  imageUrl: string;
  dateOfBirth: string | null;
  hometown: string | null;
  publicationStatus: (typeof CHARACTER_PUBLICATION_STATUSES)[number];
  voiceCredits: Array<{ seiyuuSlug: string; animeTitle: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<CharacterDocument>(
  {
    nameRomaji: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    nameKanji: { type: String, trim: true, default: null, maxlength: 200 },
    description: { type: String, trim: true, default: null, maxlength: 10_000 },
    imageUrl: { type: String, required: true, trim: true, maxlength: 2_048 },
    dateOfBirth: { type: String, trim: true, default: null, maxlength: 100 },
    hometown: { type: String, trim: true, default: null, maxlength: 200 },
    publicationStatus: {
      type: String,
      enum: CHARACTER_PUBLICATION_STATUSES,
      default: "DRAFT",
      required: true,
    },
    voiceCredits: [
      new Schema(
        {
          seiyuuSlug: { type: String, required: true, trim: true, lowercase: true, maxlength: 220 },
          animeTitle: { type: String, required: true, trim: true, maxlength: 200 },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true, versionKey: false },
);

characterSchema.index({ publicationStatus: 1, nameRomaji: 1 });
characterSchema.index({ "voiceCredits.seiyuuSlug": 1, publicationStatus: 1 });

export const Character =
  (models.Character as Model<CharacterDocument> | undefined) ??
  model<CharacterDocument>("Character", characterSchema);

