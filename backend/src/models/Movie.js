import mongoose, { Schema, Document, Model } from "mongoose";
const MovieSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    releaseYear: {
        type: Number,
        required: true,
        min: 1888,
        max: 2100,
    },
    runtimeMinutes: {
        type: Number,
        required: true,
        min: 1,
    },
    prerequisites: [
        {
            type: Schema.Types.ObjectId,
            ref: "Movie",
            default: [],
        },
    ],
    watched: {
        type: Boolean,
        required: true,
        default: false,
    },
    posterUrl: {
        type: String,
        trim: true,
        default: "",
    },
}, {
    timestamps: true,
});
export const Movie = mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
//# sourceMappingURL=Movie.js.map