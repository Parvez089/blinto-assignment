import { Router } from "express";
import { getAllMovies, createMovie, updateMovie, deleteMovie, getMovieRewatchPlan, } from "../controllers/movie.controller.js";
const router = Router();
router.get("/", getAllMovies);
router.post("/", createMovie);
router.patch("/:id", updateMovie);
router.delete("/:id", deleteMovie);
router.get("/:id/rewatch-plan", getMovieRewatchPlan);
export default router;
//# sourceMappingURL=movie.routes.js.map