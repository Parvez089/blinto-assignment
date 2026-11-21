import React, { useEffect, useState } from "react";
import { ApiError, moviesApi } from "../../api/client";
import type { Movie, RewatchPlanResponse } from "../../types";

interface RewatchTimelineProps {
  movies: Movie[];
  selectedMovieId: string;
  onSelectMovieId: (id: string) => void;
  onToggleWatched: (movie: Movie) => Promise<void>;
}

export const RewatchTimeline: React.FC<RewatchTimelineProps> = ({
  movies,
  selectedMovieId,
  onSelectMovieId,
  onToggleWatched,
}) => {
  const [plan, setPlan] = useState<RewatchPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadPlan = async (movieId: string) => {
    if (!movieId) {
      setPlan(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await moviesApi.rewatchPlan(movieId);
      setPlan(data);
    } catch (err) {
      setPlan(null);
      setError(
        err instanceof ApiError ? err.message : "Failed to load rewatch plan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMovieId) {
      void loadPlan(selectedMovieId);
    }
  }, [selectedMovieId, movies]);

  const handleStepToggle = async (movie: Movie) => {
    try {
      setTogglingId(movie.id);
      await onToggleWatched(movie);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <section className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121216] p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase">
            Topological Dependency Order
          </span>
          <h2 className="mt-1 text-lg font-bold break-words text-white sm:text-xl">
            Rewatch Timeline Planner
          </h2>
          <p className="mt-0.5 text-xs break-words text-zinc-400">
            Select a target movie to compute ordered prerequisites and
            remaining watch runtime.
          </p>
        </div>

        <div className="w-full min-w-0 lg:w-72">
          <label className="block text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
            Target Movie
          </label>
          <select
            value={selectedMovieId}
            onChange={(e) => onSelectMovieId(e.target.value)}
            className="mt-1.5 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
          >
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.releaseYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6 text-center text-sm text-zinc-400 sm:p-8">
          Computing topological rewatch sequence...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm break-words text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && plan && (
        <>
          {/* Plan summary strip */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:p-4">
              <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                Target Climax
              </p>
              <p className="mt-1 truncate text-sm font-bold text-white sm:text-base">
                {plan.targetMovie.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {plan.orderedPrerequisites.length} ordered prerequisite(s)
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:p-4">
              <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                Unwatched Blockers
              </p>
              <p className="mt-1 text-xl font-bold text-amber-400 sm:text-2xl">
                {plan.unwatchedPrerequisites.length}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Movies still needing watch completion
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:col-span-2 sm:p-4 lg:col-span-1">
              <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                Remaining Plan Runtime
              </p>
              <p className="mt-1 text-xl font-bold text-red-400 sm:text-2xl">
                {plan.remainingRuntimeMinutes} min
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Total sequence runtime: {plan.totalPlanRuntimeMinutes} min
              </p>
            </div>
          </div>

          {/* Ordered prerequisite steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-zinc-200 uppercase">
              Recommended Watch Sequence
            </h3>

            {plan.orderedPrerequisites.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-[#121216] p-4 text-sm break-words text-zinc-400 sm:p-6">
                No prerequisites required before watching{" "}
                <span className="font-semibold text-white">
                  {plan.targetMovie.title}
                </span>
                .
              </div>
            ) : (
              <div className="space-y-2.5">
                {plan.orderedPrerequisites.map((stepMovie, index) => (
                  <div
                    key={stepMovie.id}
                    className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:flex-row sm:items-center sm:p-4"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-xs font-bold text-red-400 ring-1 ring-red-500/40">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h4 className="text-sm font-bold break-words text-white">
                            {stepMovie.title}
                          </h4>
                          <span className="text-xs whitespace-nowrap text-zinc-400">
                            ({stepMovie.releaseYear}) • {stepMovie.runtimeMinutes}{" "}
                            min
                          </span>
                        </div>
                        <span
                          className={`mt-1 inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                            stepMovie.watched
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {stepMovie.watched ? "Watched" : "Unwatched"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={togglingId === stepMovie.id}
                      onClick={() => void handleStepToggle(stepMovie)}
                      className="w-full shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-zinc-200 transition hover:border-red-500/50 hover:text-white disabled:opacity-50 sm:w-auto"
                    >
                      {togglingId === stepMovie.id
                        ? "Updating..."
                        : stepMovie.watched
                        ? "Mark Unwatched"
                        : "Mark Watched"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};