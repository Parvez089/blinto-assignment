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

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [progress, setProgress] = useState<ProgressSummary>(INITIAL_PROGRESS);
  const [selectedPlanMovieId, setSelectedPlanMovieId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  const handleCreateMovie = async (payload: CreateMoviePayload) => {
    await moviesApi.create(payload);
    await loadMovies();
  };

  const handleUpdateMovie = async (id: string, payload: UpdateMoviePayload) => {
    await moviesApi.update(id, payload);
    await loadMovies();
  };

  const handleDeleteMovie = async (movie: Movie) => {
    const confirmed = window.confirm(
      `Delete "${movie.title}" from the vault?`
    );
    if (!confirmed) return;
    try {
      setBannerError(null);
      await moviesApi.remove(movie.id);
      await loadMovies();
    } catch (err) {
      setBannerError(
        err instanceof ApiError ? err.message : "Failed to delete movie."
      );
    }
  };

  const handleInspectRewatchPlan = (movie: Movie) => {
    setSelectedPlanMovieId(movie.id);
    setActiveTab("rewatch");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiOnline={apiOnline}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        {bannerError && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-xs text-red-200">
            <span>{bannerError}</span>
            <button
              type="button"
              onClick={() => void loadMovies()}
              className="rounded-md bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-500"
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
            onDeleteMovie={handleDeleteMovie}
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

      <footer className="mt-12 border-t border-zinc-900 bg-[#09090b] px-4 py-5 text-xs text-zinc-500 sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 sm:flex-row">
          <span>Doomsday Ready • Movie Prerequisites &amp; Ticket Optimizer</span>
          <span>
            {apiOnline ? "● MongoDB & Express Connected" : "● Disconnected"}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;