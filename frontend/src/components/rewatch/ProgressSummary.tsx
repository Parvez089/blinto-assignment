import React from "react";
import type { ProgressSummary as ProgressSummaryType } from "../../types";

interface ProgressSummaryProps {
  progress: ProgressSummaryType;
  onAddMovieClick: () => void;
}

function formatRuntime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs <= 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  progress,
  onAddMovieClick,
}) => {
  const unwatchedCount = Math.max(
    0,
    progress.totalMovies - progress.watchedCount
  );

  return (
    <section className="w-full min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-red-300 uppercase sm:px-3 sm:text-[11px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <span className="truncate">
              Vault Sync • {progress.watchedCount} of {progress.totalMovies}{" "}
              Watched ({progress.percentage}%)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight break-words text-white sm:text-2xl lg:text-3xl">
            Movie Vault &amp; Prerequisites
          </h1>
          <p className="mt-1 max-w-2xl text-xs break-words text-zinc-400 sm:text-sm">
            Track chronological watch status, validate prerequisite graphs
            against circular loops, and plan rewatch sequences.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddMovieClick}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 active:scale-[0.99] sm:w-auto"
        >
          <span>+ Add Movie</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
        />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-[11px]">
            Total Vault Titles
          </p>
          <p className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
            {progress.totalMovies}
          </p>
          <p className="mt-0.5 text-xs break-words text-zinc-500">
            {progress.watchedCount} completed in archive
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-[11px]">
            Remaining Runtime
          </p>
          <p className="mt-1.5 text-xl font-bold text-red-400 sm:text-2xl">
            {formatRuntime(progress.totalRemainingRuntimeMinutes)}
          </p>
          <p className="mt-0.5 text-xs break-words text-zinc-500">
            {progress.totalRemainingRuntimeMinutes} min across unwatched titles
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-3.5 sm:col-span-2 sm:p-4 lg:col-span-1">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:text-[11px]">
            Pending Titles
          </p>
          <p className="mt-1.5 text-xl font-bold text-amber-400 sm:text-2xl">
            {unwatchedCount}
          </p>
          <p className="mt-0.5 text-xs break-words text-zinc-500">
            Awaiting watch or prerequisite check
          </p>
        </div>
      </div>
    </section>
  );
};