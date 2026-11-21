import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movie.routes.js";
import cinemaRoutes from "./routes/cinema.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
const app = express();
// Core middleware
app.use(cors());
app.use(express.json());
// Health check route
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "doomsday-ready-api",
    });
});
// Feature routes
app.use("/api/movies", movieRoutes);
app.use("/api/cinemas", cinemaRoutes);
// 404 and centralized error handlers
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map