import mongoose from "mongoose";
import { Cinema } from "../models/Cinema.js";
import { calculateMinimumBundles } from "../algorithms/bundleQuote.js";
function serializeCinema(doc) {
    return {
        id: String(doc._id),
        _id: String(doc._id),
        name: doc.name,
        bundleSizes: doc.bundleSizes,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
// GET /api/cinemas
export async function getAllCinemas(_req, res, next) {
    try {
        const cinemas = await Cinema.find().sort({ createdAt: 1 });
        res.status(200).json({
            cinemas: cinemas.map(serializeCinema),
        });
    }
    catch (error) {
        next(error);
    }
}
// POST /api/cinemas
export async function createCinema(req, res, next) {
    try {
        const { name, bundleSizes } = req.body ?? {};
        if (!name || typeof name !== "string" || !name.trim()) {
            res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Cinema name is required.",
            });
            return;
        }
        if (!Array.isArray(bundleSizes) ||
            bundleSizes.length === 0 ||
            !bundleSizes.every((n) => typeof n === "number" && Number.isInteger(n) && n > 0)) {
            res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "bundleSizes must be a non-empty array of positive integers.",
            });
            return;
        }
        const created = await Cinema.create({
            name: name.trim(),
            bundleSizes,
        });
        res.status(201).json({
            cinema: serializeCinema(created),
        });
    }
    catch (error) {
        next(error);
    }
}
// POST /api/cinemas/:id/bundle-quote
export async function getCinemaBundleQuote(req, res, next) {
    try {
        const id = String(req.params.id ?? "");
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                error: "INVALID_ID",
                message: "Invalid cinema ID.",
            });
            return;
        }
        const cinema = await Cinema.findById(id);
        if (!cinema) {
            res.status(404).json({
                error: "NOT_FOUND",
                message: "Cinema not found.",
            });
            return;
        }
        const rawSeats = req.body?.seats ?? req.query?.seats;
        const requestedSeats = Number(rawSeats);
        if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) {
            res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "seats must be a positive integer.",
            });
            return;
        }
        const quote = calculateMinimumBundles(cinema.bundleSizes, requestedSeats);
        res.status(200).json({
            cinema: serializeCinema(cinema),
            quote,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=cinema.controller.js.map