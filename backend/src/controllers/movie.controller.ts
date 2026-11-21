import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Movie, type IMovie } from "../models/Movie.js";
import {
  assertNoCircularDependencies,
  buildRewatchPlan,
  type MovieNodeInput,
} from "../algorithms/rewatchOrder.js";

function toMovieNodeInput(doc: IMovie): MovieNodeInput {
  const prereqs = Array.isArray(doc.prerequisites)
    ? doc.prerequisites.map((p) =>
        typeof p === "object" && p !== null && "_id" in p
          ? String((p as { _id: unknown })._id)
          : String(p)
      )
    : [];

  return {
    id: String(doc._id),
    title: doc.title,
    releaseYear: doc.releaseYear,
    runtimeMinutes: doc.runtimeMinutes,
    prerequisites: prereqs,
    watched: doc.watched,
    posterUrl: doc.posterUrl || "",
  };
}

function serializeMovie(doc: IMovie) {
  return {
    id: String(doc._id),
    _id: String(doc._id),
    title: doc.title,
    releaseYear: doc.releaseYear,
    runtimeMinutes: doc.runtimeMinutes,
    prerequisites: Array.isArray(doc.prerequisites)
      ? doc.prerequisites.map((p) => String(p))
      : [],
    watched: doc.watched,
    posterUrl: doc.posterUrl || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// GET /api/movies
export async function getAllMovies(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const movies = await Movie.find().sort({ releaseYear: 1, createdAt: 1 });
    const totalMovies = movies.length;
    const watchedCount = movies.filter((m) => m.watched).length;
    const percentage =
      totalMovies > 0 ? Math.round((watchedCount / totalMovies) * 100) : 0;
    const totalRemainingRuntimeMinutes = movies
      .filter((m) => !m.watched)
      .reduce((sum, m) => sum + m.runtimeMinutes, 0);

    res.status(200).json({
      movies: movies.map(serializeMovie),
      progress: {
        watchedCount,
        totalMovies,
        percentage,
        totalRemainingRuntimeMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/movies
export async function createMovie(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      title,
      releaseYear,
      runtimeMinutes,
      prerequisites = [],
      watched = false,
      posterUrl = "",
    } = req.body ?? {};

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Movie title is required.",
      });
      return;
    }

    const parsedYear = Number(releaseYear);
    const parsedRuntime = Number(runtimeMinutes);

    if (!Number.isInteger(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Valid releaseYear is required.",
      });
      return;
    }

    if (!Number.isInteger(parsedRuntime) || parsedRuntime <= 0) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "runtimeMinutes must be a positive integer.",
      });
      return;
    }

    const rawPrereqs: string[] = Array.isArray(prerequisites)
      ? prerequisites.map((id) => String(id))
      : [];

    for (const prereqId of rawPrereqs) {
      if (!mongoose.Types.ObjectId.isValid(prereqId)) {
        res.status(400).json({
          error: "INVALID_ID",
          message: `Invalid prerequisite movie ID: ${prereqId}`,
        });
        return;
      }
    }

    // Validate full graph with a temporary candidate node before persisting
    const existingDocs = await Movie.find();
    const candidateId = new mongoose.Types.ObjectId().toString();
    const graphNodes: MovieNodeInput[] = [
      ...existingDocs.map(toMovieNodeInput),
      {
        id: candidateId,
        title: title.trim(),
        releaseYear: parsedYear,
        runtimeMinutes: parsedRuntime,
        prerequisites: rawPrereqs,
        watched: Boolean(watched),
        posterUrl: typeof posterUrl === "string" ? posterUrl.trim() : "",
      },
    ];

    assertNoCircularDependencies(graphNodes);

    const created = await Movie.create({
      title: title.trim(),
      releaseYear: parsedYear,
      runtimeMinutes: parsedRuntime,
      prerequisites: rawPrereqs.map((id) => new mongoose.Types.ObjectId(id)),
      watched: Boolean(watched),
      posterUrl: typeof posterUrl === "string" ? posterUrl.trim() : "",
    });

    res.status(201).json({
      movie: serializeMovie(created),
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/movies/:id
export async function updateMovie(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id ?? "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: "INVALID_ID",
        message: "Invalid movie ID.",
      });
      return;
    }

    const targetDoc = await Movie.findById(id);
    if (!targetDoc) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Movie not found.",
      });
      return;
    }

    const { title, releaseYear, runtimeMinutes, prerequisites, watched, posterUrl } =
      req.body ?? {};

    let nextPrereqIds: string[] = targetDoc.prerequisites.map((p) => String(p));
    if (prerequisites !== undefined) {
      if (!Array.isArray(prerequisites)) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "prerequisites must be an array of movie IDs.",
        });
        return;
      }
      for (const prereqId of prerequisites) {
        const strId = String(prereqId);
        if (!mongoose.Types.ObjectId.isValid(strId)) {
          res.status(400).json({
            error: "INVALID_ID",
            message: `Invalid prerequisite movie ID: ${strId}`,
          });
          return;
        }
      }
      nextPrereqIds = prerequisites.map((p) => String(p));
    }

    // Check cycle against current graph state before saving changes
  const allDocs = await Movie.find();
    const simulatedNodes: MovieNodeInput[] = allDocs.map((doc) => {
      const base = toMovieNodeInput(doc);
      if (base.id !== id) return base;

      const nextTitle =
        typeof title === "string" && title.trim() ? title.trim() : base.title;
      const nextYear =
        releaseYear !== undefined ? Number(releaseYear) : base.releaseYear;
      const nextRuntime =
        runtimeMinutes !== undefined
          ? Number(runtimeMinutes)
          : base.runtimeMinutes;
      const nextWatched =
        watched !== undefined ? Boolean(watched) : base.watched;
      const nextPosterUrl =
        posterUrl !== undefined
          ? String(posterUrl).trim()
          : (base.posterUrl ?? "");

      return {
        id: base.id,
        title: nextTitle,
        releaseYear: nextYear,
        runtimeMinutes: nextRuntime,
        prerequisites: nextPrereqIds,
        watched: nextWatched,
        posterUrl: nextPosterUrl,
      };
    });

    assertNoCircularDependencies(simulatedNodes);

    if (typeof title === "string" && title.trim()) {
      targetDoc.title = title.trim();
    }
    if (releaseYear !== undefined) {
      targetDoc.releaseYear = Number(releaseYear);
    }
    if (runtimeMinutes !== undefined) {
      targetDoc.runtimeMinutes = Number(runtimeMinutes);
    }
    if (prerequisites !== undefined) {
      targetDoc.prerequisites = nextPrereqIds.map(
        (prereqId) => new mongoose.Types.ObjectId(prereqId)
      );
    }
    if (watched !== undefined) {
      targetDoc.watched = Boolean(watched);
    }
    if (posterUrl !== undefined) {
      targetDoc.posterUrl = String(posterUrl).trim();
    }

    await targetDoc.save();

    res.status(200).json({
      movie: serializeMovie(targetDoc),
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/movies/:id
export async function deleteMovie(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id ?? "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: "INVALID_ID",
        message: "Invalid movie ID.",
      });
      return;
    }

    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Movie not found.",
      });
      return;
    }

    // Remove deleted movie ID from other movies' prerequisite lists
    await Movie.updateMany(
      { prerequisites: deleted._id },
      { $pull: { prerequisites: deleted._id } }
    );

    res.status(200).json({
      deletedId: String(deleted._id),
      message: "Movie deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/movies/:id/rewatch-plan
export async function getMovieRewatchPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id ?? "");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: "INVALID_ID",
        message: "Invalid movie ID.",
      });
      return;
    }

    const allDocs = await Movie.find().sort({ releaseYear: 1, createdAt: 1 });
    const exists = allDocs.some((doc) => String(doc._id) === id);
    if (!exists) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "Target movie not found.",
      });
      return;
    }

    const nodes = allDocs.map(toMovieNodeInput);
    const plan = buildRewatchPlan(nodes, id);

    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
}