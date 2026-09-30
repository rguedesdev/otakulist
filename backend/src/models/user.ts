import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const USER_ROLES = ["FREE", "VIP", "ZEUS"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserDocument {
  username: string;
  displayName: string;
  bio: string | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl: string | null;
  showAdultContent: boolean;
  hideAdultContentFromVisitors: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 24,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    bio: { type: String, default: null, trim: true, maxlength: 300 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      select: false,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "FREE", required: true },
    avatarUrl: { type: String, default: null },
    showAdultContent: { type: Boolean, default: false, required: true },
    hideAdultContentFromVisitors: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = (models.User as Model<UserDocument> | undefined) ?? model<UserDocument>("User", userSchema);
