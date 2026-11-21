import type {
  ApiErrorBody,
  BundleQuoteResponse,
  CinemasResponse,
  CreateMoviePayload,
  Movie,
  MoviesResponse,
  RewatchPlanResponse,
  UpdateMoviePayload,
} from "../types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  code: string;
  cyclePath?: string[];

  constructor(
    message: string,
    status: number,
    code = "API_ERROR",
    cyclePath?: string[]
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (cyclePath) {
      this.cyclePath = cyclePath;
    }
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    throw new ApiError(
      payload.message || `Request failed (${res.status})`,
      res.status,
      payload.error || "API_ERROR",
      payload.cyclePath
    );
  }

  return payload as T;
}

export const moviesApi = {
  list: () => request<MoviesResponse>("/movies"),
  create: async (data: CreateMoviePayload): Promise<Movie> => {
    const res = await request<{ movie: Movie }>("/movies", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.movie;
  },
  update: async (id: string, data: UpdateMoviePayload): Promise<Movie> => {
    const res = await request<{ movie: Movie }>(`/movies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.movie;
  },
  remove: (id: string) =>
    request<{ deletedId: string; message: string }>(`/movies/${id}`, {
      method: "DELETE",
    }),
  rewatchPlan: (id: string) =>
    request<RewatchPlanResponse>(`/movies/${id}/rewatch-plan`),
};

export const cinemasApi = {
  list: () => request<CinemasResponse>("/cinemas"),
  bundleQuote: (cinemaId: string, seats: number) =>
    request<BundleQuoteResponse>(`/cinemas/${cinemaId}/bundle-quote`, {
      method: "POST",
      body: JSON.stringify({ seats }),
    }),
};