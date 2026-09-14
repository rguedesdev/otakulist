import mongoose, { type Model, type Types } from "mongoose";

const { Schema, model, models } = mongoose;

interface SessionDocument {
  _id: string;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
    userAgent: { type: String, maxlength: 500 },
    ip: { type: String, maxlength: 100 },
  },
  { timestamps: true, versionKey: false },
);

export const Session =
  (models.Session as Model<SessionDocument> | undefined) ?? model<SessionDocument>("Session", sessionSchema);
