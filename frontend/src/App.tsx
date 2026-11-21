import { useCallback, useEffect, useState } from "react";
import { ApiError, moviesApi } from "./api/client";
import { BundleOptimizer } from "./components/booking/BundleOptimizer";
import { Navbar } from "./components/layout/Navbar";
import { RewatchTimeline } from "./components/rewatch/RewatchTimeline";
import { DashboardPage } from "./pages/DashboardPage";
import type {
  ActiveTab,
  CreateMoviePayload,
  Movie,
  ProgressSummary,
  UpdateMoviePayload,
} from "./types";

const INITIAL_PROGRESS: ProgressSummary = {
  watchedCount: 0,
  totalMovies: 0,
  percentage: 0,
  totalRemainingRuntimeMinutes: 0,
};

const GITHUB_REPO_URL = "https://github.com/Parvez089/blinto-assignment";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [progress, setProgress] = useState<ProgressSummary>(INITIAL_PROGRESS);
  const [selectedPlanMovieId, setSelectedPlanMovieId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadMovies = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setBannerError(null);
      const data = await moviesApi.list();
      setMovies(data.movies);
      setProgress(data.progress);
      setApiOnline(true);

      setSelectedPlanMovieId((prev) => {
        if (prev && data.movies.some((m) => m.id === prev)) {
          return prev;
        }
        const climax = data.movies.find((m) =>
          m.title.toLowerCase().includes("doomsday")
        );
        return climax?.id || data.movies[0]?.id || "";
      });
    } catch (err) {
      setApiOnline(false);
      setBannerError(
        err instanceof ApiError
          ? err.message
          : "Cannot reach backend server at http://localhost:5000/api"
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadMovies(true);
  }, [loadMovies]);

  const handleCreateMovie = async (payload: CreateMoviePayload) => {
    await moviesApi.create(payload);
    await loadMovies(false);
  };

  const handleUpdateMovie = async (id: string, payload: UpdateMoviePayload) => {
    await moviesApi.update(id, payload);
    await loadMovies(false);
  };

  const handleRequestDeleteMovie = async (movie: Movie): Promise<void> => {
    setMovieToDelete(movie);
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setMovieToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      setDeleting(true);
      setBannerError(null);
      await moviesApi.remove(movieToDelete.id);
      setMovieToDelete(null);
      await loadMovies(false);
    } catch (err) {
      setBannerError(
        err instanceof ApiError ? err.message : "Failed to delete movie."
      );
      setMovieToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleInspectRewatchPlan = (movie: Movie) => {
    setSelectedPlanMovieId(movie.id);
    setActiveTab("rewatch");
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-[#09090b] text-zinc-100">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiOnline={apiOnline}
      />

      <main className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-8">
        {bannerError && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-200 sm:flex-row sm:items-center sm:gap-4">
            <span className="min-w-0 break-words">{bannerError}</span>
            <button
              type="button"
              onClick={() => void loadMovies(true)}
              className="w-full shrink-0 rounded-md bg-red-600 px-3 py-1 font-semibold whitespace-nowrap text-white hover:bg-red-500 sm:w-auto"
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === "movies" && (
          <DashboardPage
            movies={movies}
            progress={progress}
            loading={loading}
            onCreateMovie={handleCreateMovie}
            onUpdateMovie={handleUpdateMovie}
            onDeleteMovie={handleRequestDeleteMovie}
            onInspectRewatchPlan={handleInspectRewatchPlan}
          />
        )}

        {activeTab === "rewatch" && (
          <RewatchTimeline
            movies={movies}
            selectedMovieId={selectedPlanMovieId}
            onSelectMovieId={setSelectedPlanMovieId}
            onToggleWatched={async (movie) => {
              await handleUpdateMovie(movie.id, { watched: !movie.watched });
            }}
          />
        )}

        {activeTab === "booking" && <BundleOptimizer />}
      </main>

      <footer className="mt-10 w-full min-w-0 border-t border-zinc-900 bg-[#09090b] px-3 py-5 text-xs text-zinc-500 sm:mt-12 sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <span className="break-words">
            Doomsday Ready • Movie Prerequisites &amp; Ticket Optimizer
          </span>
          <span className="shrink-0 whitespace-nowrap">
            {apiOnline ? "● MongoDB & Express Connected" : "● Disconnected"}
          </span>
        </div>

        <div className="mx-auto mt-4 flex max-w-[1440px] flex-col items-center justify-center border-t border-zinc-900/80 pt-4 text-center">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Source Code &amp; Architecture
          </span>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center justify-center gap-2 rounded-lg border border-red-500/35 bg-red-950/25 px-3.5 py-1.5 text-xs font-semibold break-all text-red-300 shadow-sm transition hover:border-red-400/60 hover:bg-red-950/45 hover:text-white"
          >
            <span>GitHub Repository:</span>
            <span className="underline underline-offset-4">
              {GITHUB_REPO_URL}
            </span>
          </a>
        </div>
      </footer>

      {/* Custom Delete Confirmation Popup */}
      {movieToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={handleCancelDelete}
        >
          <div
            className="w-full max-w-md min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block rounded bg-red-600/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase ring-1 ring-red-500/30">
                  Confirm Deletion
                </span>
                <h2 className="mt-2 text-lg font-bold text-white">
                  Delete Movie from Vault?
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                aria-label="Close delete modal"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed break-words text-zinc-400 sm:text-sm">
              Are you sure you want to permanently remove{" "}
              <span className="font-semibold text-white">
                &ldquo;{movieToDelete.title}&rdquo;
              </span>{" "}
              ({movieToDelete.releaseYear}) from the vault? This action cannot be
              undone.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleting}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete Movie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;