import "dotenv/config";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import { Movie } from "../models/Movie.js";
import { Cinema } from "../models/Cinema.js";
// Match DNS resolver setup used on networks with SRV lookup restrictions
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const MONGO_URI = process.env.MONGO_URI;
const SEED_MOVIES = [
    {
        key: "outbreak_zero",
        title: "Outbreak Zero",
        releaseYear: 2016,
        runtimeMinutes: 118,
        prerequisiteKeys: [],
        watched: true,
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    },
    {
        key: "ash_horizon",
        title: "Ash Horizon",
        releaseYear: 2018,
        runtimeMinutes: 126,
        prerequisiteKeys: ["outbreak_zero"],
        watched: true,
        posterUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80",
    },
    {
        key: "vault_protocol",
        title: "Vault Protocol",
        releaseYear: 2019,
        runtimeMinutes: 134,
        prerequisiteKeys: ["outbreak_zero"],
        watched: false,
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    },
    {
        key: "silent_grid",
        title: "Silent Grid",
        releaseYear: 2021,
        runtimeMinutes: 141,
        prerequisiteKeys: ["ash_horizon", "vault_protocol"],
        watched: false,
        posterUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80",
    },
    {
        key: "last_signal",
        title: "Last Signal",
        releaseYear: 2022,
        runtimeMinutes: 112,
        prerequisiteKeys: ["vault_protocol"],
        watched: false,
        posterUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=600&q=80",
    },
    {
        key: "doomsday_dawn",
        title: "Doomsday Dawn",
        releaseYear: 2025,
        runtimeMinutes: 158,
        prerequisiteKeys: ["silent_grid", "last_signal"],
        watched: false,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    },
];
const SEED_CINEMAS = [
    {
        name: "Bunker IMAX Dome",
        bundleSizes: [2, 5, 8],
    },
    {
        name: "Starlight Vault Theater",
        bundleSizes: [3, 6],
    },
    {
        name: "Redline Night Screening",
        bundleSizes: [1, 4, 7],
    },
];
async function runSeed() {
    if (!MONGO_URI) {
        console.error("Missing MONGO_URI in environment variables.");
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding.");
        await Movie.deleteMany({});
        await Cinema.deleteMany({});
        const createdByKey = new Map();
        for (const item of SEED_MOVIES) {
            const doc = await Movie.create({
                title: item.title,
                releaseYear: item.releaseYear,
                runtimeMinutes: item.runtimeMinutes,
                prerequisites: [],
                watched: item.watched,
                posterUrl: item.posterUrl,
            });
            createdByKey.set(item.key, doc._id);
        }
        for (const item of SEED_MOVIES) {
            const movieId = createdByKey.get(item.key);
            if (!movieId)
                continue;
            const prereqIds = item.prerequisiteKeys
                .map((prereqKey) => createdByKey.get(prereqKey))
                .filter((id) => Boolean(id));
            await Movie.findByIdAndUpdate(movieId, {
                $set: { prerequisites: prereqIds },
            });
        }
        const insertedCinemas = await Cinema.insertMany(SEED_CINEMAS);
        console.log(`Seeded ${SEED_MOVIES.length} movies and ${insertedCinemas.length} cinemas successfully.`);
    }
    catch (error) {
        console.error("Error while seeding database:", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}
runSeed();
//# sourceMappingURL=seed.js.map