export interface Movie {
  id: string;
  _id?: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  prerequisites: string[];
  watched: boolean;
  posterUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressSummary {
  watchedCount: number;
  totalMovies: number;
  percentage: number;
  totalRemainingRuntimeMinutes: number;
}

export interface MoviesResponse {
  movies: Movie[];
  progress: ProgressSummary;
}

export interface RewatchPlanResponse {
  targetMovie: Movie;
  orderedPrerequisites: Movie[];
  unwatchedPrerequisites: Movie[];
  remainingRuntimeMinutes: number;
  totalPlanRuntimeMinutes: number;
  progress: ProgressSummary;
}

export interface CreateMoviePayload {
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  prerequisites?: string[];
  watched?: boolean;
  posterUrl?: string;
}

export interface UpdateMoviePayload {
  title?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  prerequisites?: string[];
  watched?: boolean;
  posterUrl?: string;
}

export interface Cinema {
  id: string;
  _id?: string;
  name: string;
  bundleSizes: number[];
}

export interface CinemasResponse {
  cinemas: Cinema[];
}

export interface BundleBreakdownItem {
  bundleSize: number;
  count: number;
  subtotalSeats: number;
}

export interface BundleQuoteResult {
  possible: boolean;
  requestedSeats: number;
  minimumBundles: number | null;
  breakdown: BundleBreakdownItem[];
}

export interface BundleQuoteResponse {
  cinema: Cinema;
  quote: BundleQuoteResult;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
  cyclePath?: string[];
}

export type ActiveTab = "movies" | "rewatch" | "booking";