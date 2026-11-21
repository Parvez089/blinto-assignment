import React, { useMemo, useState } from "react";
import { MovieCard } from "../components/movies/MovieCard";
import { MovieForm } from "../components/movies/MovieForm";
import { ProgressSummary } from "../components/rewatch/ProgressSummary";
import type {
  CreateMoviePayload,
  Movie,
  ProgressSummary as ProgressSummaryType,
  UpdateMoviePayload,
} from "../types";

interface DashboardPageProps {
  movies: Movie[];
  progress: ProgressSummaryType;
  loading: boolean;
  onCreateMovie: (payload: CreateMoviePayload) => Promise<void>;
  onUpdateMovie: (id: string, payload: UpdateMoviePayload) => Promise<void>;
  onDeleteMovie: (movie: Movie) => Promise<void>;
  onInspectRewatchPlan: (movie: Movie) => void;
}

type StatusFilter = "all" | "watched" | "unwatched";
type SortOrder = "chronological" | "title" | "runtime";

export const DashboardPage: React.FC<DashboardPageProps> = ({
  movies,
  progress,
  loading,
  onCreateMovie,
  onUpdateMovie,
  onDeleteMovie,
  onInspectRewatchPlan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("chronological");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const openCreateForm = () => {
    setFormMode("create");
    setEditingMovie(null);
    setDrawerOpen(true);
  };

  const openEditForm = (movie: Movie) => {
    setFormMode("edit");
    setEditingMovie(movie);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingMovie(null);
  };

  const handleToggleWatched = async (movie: Movie) => {
    await onUpdateMovie(movie.id, { watched: !movie.watched });
  };

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = movies.filter((m) => {
      if (statusFilter === "watched" && !m.watched) return false;
      if (statusFilter === "unwatched" && m.watched) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        String(m.releaseYear).includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortOrder === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortOrder === "runtime") {
        return b.runtimeMinutes - a.runtimeMinutes;
      }
      return a.releaseYear - b.releaseYear || a.title.localeCompare(b.title);
    });
  }, [movies, searchQuery, statusFilter, sortOrder]);

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <ProgressSummary
        progress={progress}
        onAddMovieClick={openCreateForm}
      />

      {/* Filter & sort bar */}
      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-800/90 bg-[#121216] p-3 sm:p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie by title or year..."
            className="w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none sm:w-64"
          />

          <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg bg-zinc-950 p-1 sm:w-auto">
            {(
              [
                { id: "all", label: `All (${movies.length})` },
                { id: "watched", label: "Watched" },
                { id: "unwatched", label: "Unwatched" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition sm:flex-initial ${
                  statusFilter === tab.id
                    ? "bg-red-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <span className="shrink-0 text-[11px] font-semibold text-zinc-500 uppercase">
            Sort:
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-200 focus:border-red-500 focus:outline-none sm:flex-initial"
          >
            <option value="chronological">Chronological Year</option>
            <option value="title">Title (A–Z)</option>
            <option value="runtime">Runtime (Longest)</option>
          </select>
        </div>
      </div>

      {/* Main grid + optional edit/create panel */}
      <div
        className={`grid min-w-0 grid-cols-1 gap-5 sm:gap-6 ${
          drawerOpen ? "lg:grid-cols-12" : "grid-cols-1"
        }`}
      >
        <div
          className={`min-w-0 ${
            drawerOpen ? "lg:col-span-8" : "lg:col-span-12"
          }`}
        >
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-[#121216] p-8 text-center text-sm text-zinc-400 sm:p-10">
              Loading movie vault from backend...
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-[#121216] p-8 text-center text-sm text-zinc-400 sm:p-10">
              No movies match your current filter.
            </div>
          ) : (
            <div
              className={`grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 ${
                drawerOpen ? "xl:grid-cols-2" : "lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  allMovies={movies}
                  isSelectedForEdit={
                    drawerOpen &&
                    formMode === "edit" &&
                    editingMovie?.id === movie.id
                  }
                  onToggleWatched={(m) => void handleToggleWatched(m)}
                  onEdit={openEditForm}
                  onDelete={(m) => void onDeleteMovie(m)}
                  onInspectRewatchPlan={onInspectRewatchPlan}
                />
              ))}
            </div>
          )}
        </div>

        {drawerOpen && (
          <div className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <MovieForm
                mode={formMode}
                initialMovie={editingMovie}
                availableMovies={movies}
                onClose={closeDrawer}
                onSubmitCreate={onCreateMovie}
                onSubmitUpdate={onUpdateMovie}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};