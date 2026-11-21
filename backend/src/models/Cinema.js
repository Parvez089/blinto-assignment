import mongoose, { Schema, Document, Model } from "mongoose";
const CinemaSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    bundleSizes: {
        type: [Number],
        required: true,
        validate: {
            validator: (sizes) => Array.isArray(sizes) &&
                sizes.length > 0 &&
                sizes.every((n) => Number.isInteger(n) && n > 0),
            message: "bundleSizes must be a non-empty array of positive integers.",
        },
    },
}, {
    timestamps: true,
});
export const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", CinemaSchema);
//# sourceMappingURL=Cinema.js.map