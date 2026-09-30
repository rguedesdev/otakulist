import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface PersonDocument {
  displayName: string;
  slug: string;
  nameKanji: string | null;
  imageUrl: string | null;
  description: string | null;
  roles: string[];
  dateOfBirth: string | null;
  hometown: string | null;
  agency: string | null;
  activityPeriod: string | null;
  occupations: string[];
  externalLinks: Record<string, string | undefined>;
  publicationStatus: "DRAFT" | "PUBLISHED";
  createdAt: Date;
  updatedAt: Date;
}

const personSchema = new Schema<PersonDocument>(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    nameKanji: { type: String, trim: true, default: null, maxlength: 200 },
    imageUrl: { type: String, trim: true, default: null },
    description: { type: String, trim: true, default: null, maxlength: 10_000 },
    roles: [{ type: String, enum: ["SEIYUU", "ARTIST", "MANGAKA", "STAFF"] }],
    dateOfBirth: { type: String, trim: true, default: null, maxlength: 100 },
    hometown: { type: String, trim: true, default: null, maxlength: 200 },
    agency: { type: String, trim: true, default: null, maxlength: 200 },
    activityPeriod: { type: String, trim: true, default: null, maxlength: 200 },
    occupations: [{ type: String, trim: true, maxlength: 120 }],
    externalLinks: {
      website: { type: String, trim: true, default: undefined },
      x: { type: String, trim: true, default: undefined },
      instagram: { type: String, trim: true, default: undefined },
      pixiv: { type: String, trim: true, default: undefined },
      youtube: { type: String, trim: true, default: undefined },
    },
    publicationStatus: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", required: true },
  },
  { timestamps: true, versionKey: false },
);

personSchema.index({ publicationStatus: 1, displayName: 1 });
personSchema.index({ roles: 1, publicationStatus: 1, displayName: 1 });

export const Person =
  (models.Person as Model<PersonDocument> | undefined) ?? model<PersonDocument>("Person", personSchema);
