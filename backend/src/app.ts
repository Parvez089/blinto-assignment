// app.ts
import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movie.routes.js";
import cinemaRoutes from "./routes/cinema.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS configuration - Allow Vercel domain
app.use(cors({
  origin: [
    "https://blinto-assignment.vercel.app",
    "http://localhost:3000", // For local development
    "http://localhost:5173"  // If using Vite
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // If sending cookies or authentication headers
}));

// Core middleware
app.use(express.json());

// Health check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "doomsday-ready-api",
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Feature routes
app.use("/api/movies", movieRoutes);
app.use("/api/cinemas", cinemaRoutes);

// 404 and centralized error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;