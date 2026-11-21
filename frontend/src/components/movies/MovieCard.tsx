import React from "react";
import type { Movie } from "../../types";

interface MovieCardProps {
  movie: Movie;
  allMovies: Movie[];
  isSelectedForEdit: boolean;
  onToggleWatched: (movie: Movie) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  onInspectRewatchPlan: (movie: Movie) => void;
}

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80";

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  allMovies,
  isSelectedForEdit,
  onToggleWatched,
  onEdit,
  onDelete,
  onInspectRewatchPlan,
}) => {
  const movieMap = new Map(allMovies.map((m) => [m.id, m]));
  const prereqMovies = movie.prerequisites
    .map((id) => movieMap.get(id))
    .filter((m): m is Movie => Boolean(m));

  const unwatchedPrereqs = prereqMovies.filter((p) => !p.watched);
  const hasBlockers = !movie.watched && unwatchedPrereqs.length > 0;

  return (
    <article
      className={`group flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border bg-[#121216] transition ${
        isSelectedForEdit
          ? "border-red-500 ring-1 ring-red-500/50"
          : "border-zinc-800/90 hover:border-zinc-700"
      }`}
    >
      <div className="min-w-0">
        {/* Poster header */}
        <div className="relative h-32 w-full overflow-hidden bg-zinc-900 sm:h-36">
          <img
            src={movie.posterUrl || FALLBACK_POSTER}
            alt={movie.title}
            className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-95"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== FALLBACK_POSTER) {
                target.src = FALLBACK_POSTER;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/30 to-transparent" />

          <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1 sm:top-2.5 sm:left-2.5 sm:gap-1.5">
            <span className="rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-zinc-200 ring-1 ring-white/10 sm:px-2 sm:text-[11px]">
              {movie.releaseYear}
            </span>
            <span className="rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-zinc-300 ring-1 ring-white/10 sm:px-2 sm:text-[11px]">
              {movie.runtimeMinutes} min
            </span>
          </div>

          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            {movie.watched ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-emerald-300 ring-1 ring-emerald-500/30 sm:px-2.5 sm:text-[11px]">
                ✓ Watched
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-red-300 ring-1 ring-red-500/30 sm:px-2.5 sm:text-[11px]">
                ● Unwatched
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-bold break-words text-white sm:text-base">
            {movie.title}
          </h3>

          <div className="mt-2.5 sm:mt-3">
            <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              Prerequisites ({prereqMovies.length})
            </p>
            {prereqMovies.length === 0 ? (
              <p className="mt-1 text-xs text-zinc-500">
                No prerequisites (Root entry)
              </p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {prereqMovies.map((prereq) => (
                  <span
                    key={prereq.id}
                    className={`max-w-full truncate rounded px-2 py-0.5 text-[11px] font-medium ${
                      prereq.watched
                        ? "bg-zinc-800/90 text-zinc-300"
                        : "bg-red-950/60 text-red-300 ring-1 ring-red-500/30"
                    }`}
                    title={prereq.title}
                  >
                    {prereq.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          {hasBlockers && (
            <p className="mt-2 text-[11px] font-medium text-amber-400 sm:mt-2.5">
              {unwatchedPrereqs.length} prerequisite(s) still unwatched
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 bg-zinc-950/50 px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleWatched(movie)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
              movie.watched
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                : "bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-600/30"
            }`}
          >
            {movie.watched ? "Mark Unwatched" : "Mark Watched"}
          </button>

          <button
            type="button"
            onClick={() => onInspectRewatchPlan(movie)}
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-300 ring-1 ring-zinc-700/80 transition hover:bg-zinc-800 hover:text-white"
          >
            Plan
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(movie)}
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-200 ring-1 ring-zinc-700/80 transition hover:border-red-500/50 hover:text-red-300"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(movie)}
            className="rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-zinc-500 transition hover:bg-red-950/50 hover:text-red-400"
            title="Delete movie"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};