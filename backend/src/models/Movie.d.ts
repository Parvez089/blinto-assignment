import mongoose, { Document, Model } from "mongoose";
export interface IMovie extends Document {
    title: string;
    releaseYear: number;
    runtimeMinutes: number;
    prerequisites: mongoose.Types.ObjectId[];
    watched: boolean;
    posterUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Movie: Model<IMovie>;
//# sourceMappingURL=Movie.d.ts.map