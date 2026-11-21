import dns from "node:dns/promises";

// Use public DNS resolvers to avoid SRV lookup issues on some networks
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

interface AppError extends Error {
  code?: string;
  statusCode?: number;
}

// Middleware configuration
app.use(cors());
app.use(express.json());

// Health check endpoint to verify server status
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "doomsday-ready-api",
  });
});

// Mount feature routes under /api
// import movieRoutes from "./routes/movie.routes.js";
// import cinemaRoutes from "./routes/cinema.routes.js";
// app.use("/api/movies", movieRoutes);
// app.use("/api/cinemas", cinemaRoutes);

// Centralized error handler (including 409 CIRCULAR_DEPENDENCY)
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);

  if (err.code === "CIRCULAR_DEPENDENCY" || err.statusCode === 409) {
    return res.status(409).json({
      error: "CIRCULAR_DEPENDENCY",
      message:
        err.message ||
        "A movie cannot depend on itself directly or through other movies.",
    });
  }

  return res.status(err.statusCode || 500).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Something went wrong on the server.",
  });
});

// Connect to MongoDB first, then start listening for requests
async function startServer(): Promise<void> {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();