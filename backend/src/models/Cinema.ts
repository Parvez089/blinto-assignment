import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICinema extends Document {
  name: string;
  bundleSizes: number[];
  createdAt: Date;
  updatedAt: Date;
}

const CinemaSchema = new Schema<ICinema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bundleSizes: {
      type: [Number],
      required: true,
      validate: {
        validator: (sizes: number[]) =>
          Array.isArray(sizes) &&
          sizes.length > 0 &&
          sizes.every((n) => Number.isInteger(n) && n > 0),
        message: "bundleSizes must be a non-empty array of positive integers.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Cinema: Model<ICinema> =
  mongoose.models.Cinema || mongoose.model<ICinema>("Cinema", CinemaSchema);