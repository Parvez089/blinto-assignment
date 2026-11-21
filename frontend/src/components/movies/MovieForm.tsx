import React, { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import type {
  CreateMoviePayload,
  Movie,
  UpdateMoviePayload,
} from "../../types";

interface MovieFormProps {
  mode: "create" | "edit";
  initialMovie?: Movie | null;
  availableMovies: Movie[];
  onClose: () => void;
  onSubmitCreate: (payload: CreateMoviePayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateMoviePayload) => Promise<void>;
}

export const MovieForm: React.FC<MovieFormProps> = ({
  mode,
  initialMovie,
  availableMovies,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState<string>("2025");
  const [runtimeMinutes, setRuntimeMinutes] = useState<string>("135");
  const [watched, setWatched] = useState<boolean>(false);
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [cyclePath, setCyclePath] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    setErrorMsg(null);
    setErrorCode(null);
    setCyclePath(undefined);

    if (mode === "edit" && initialMovie) {
      setTitle(initialMovie.title);
      setReleaseYear(String(initialMovie.releaseYear));
      setRuntimeMinutes(String(initialMovie.runtimeMinutes));
      setWatched(initialMovie.watched);
      setPosterUrl(initialMovie.posterUrl || "");
      setPrerequisites(initialMovie.prerequisites || []);
      setSelectedPrereqToAdd("");
    } else {
      setTitle("");
      setReleaseYear("2025");
      setRuntimeMinutes("135");
      setWatched(false);
      setPosterUrl("");
      setPrerequisites([]);
      setSelectedPrereqToAdd("");
    }
  }, [mode, initialMovie]);

  const candidatePrereqs = availableMovies.filter(
    (m) => m.id !== initialMovie?.id && !prerequisites.includes(m.id)
  );

  const handleAddPrerequisite = () => {
    if (!selectedPrereqToAdd || prerequisites.includes(selectedPrereqToAdd)) {
      return;
    }
    setPrerequisites((prev) => [...prev, selectedPrereqToAdd]);
    setSelectedPrereqToAdd("");
  };

  const handleRemovePrerequisite = (idToRemove: string) => {
    setPrerequisites((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorCode(null);
    setCyclePath(undefined);

    const parsedYear = Number(releaseYear);
    const parsedRuntime = Number(runtimeMinutes);

    if (!title.trim()) {
      setErrorMsg("Movie title is required.");
      return;
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
      setErrorMsg("Release year must be between 1888 and 2100.");
      return;
    }
    if (!Number.isInteger(parsedRuntime) || parsedRuntime <= 0) {
      setErrorMsg("Runtime must be a positive number of minutes.");
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "edit" && initialMovie) {
        const payload: UpdateMoviePayload = {
          title: title.trim(),
          releaseYear: parsedYear,
          runtimeMinutes: parsedRuntime,
          watched,
          prerequisites,
          posterUrl: posterUrl.trim(),
        };
        await onSubmitUpdate(initialMovie.id, payload);
      } else {
        const payload: CreateMoviePayload = {
          title: title.trim(),
          releaseYear: parsedYear,
          runtimeMinutes: parsedRuntime,
          watched,
          prerequisites,
        };
        if (posterUrl.trim()) {
          payload.posterUrl = posterUrl.trim();
        }
        await onSubmitCreate(payload);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
        setErrorCode(err.code);
        setCyclePath(err.cyclePath);
      } else {
        setErrorMsg("Unable to save movie changes.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const movieLookup = new Map(availableMovies.map((m) => [m.id, m.title]));

  return (
    <aside className="w-full min-w-0 rounded-xl border border-zinc-800 bg-[#121216] p-4 shadow-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3.5 sm:pb-4">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded bg-red-600/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase ring-1 ring-red-500/30">
            {mode === "edit" ? "Edit Vault Entry" : "New Vault Entry"}
          </span>
          <h2 className="mt-1.5 truncate text-base font-bold text-white sm:text-lg">
            {mode === "edit" && initialMovie
              ? `Edit: ${initialMovie.title}`
              : "Add New Movie"}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Close form"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 min-w-0 space-y-4">
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-zinc-300">
            Movie Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Doomsday Dawn"
            className="mt-1.5 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-zinc-300">
              Release Year
            </label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              min={1888}
              max={2100}
              className="mt-1.5 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-zinc-300">
              Runtime (min)
            </label>
            <input
              type="number"
              value={runtimeMinutes}
              onChange={(e) => setRuntimeMinutes(e.target.value)}
              min={1}
              className="mt-1.5 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Prerequisites selector */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-zinc-300">
            Prerequisites ({prerequisites.length})
          </label>

          {prerequisites.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prerequisites.map((prereqId) => (
                <span
                  key={prereqId}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200"
                >
                  <span className="truncate">
                    {movieLookup.get(prereqId) || prereqId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrerequisite(prereqId)}
                    className="shrink-0 text-zinc-400 hover:text-red-400"
                    title="Remove prerequisite"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedPrereqToAdd}
              onChange={(e) => setSelectedPrereqToAdd(e.target.value)}
              className="w-full min-w-0 flex-1 rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">+ Select prerequisite movie...</option>
              {candidatePrereqs.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.releaseYear})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddPrerequisite}
              disabled={!selectedPrereqToAdd}
              className="w-full shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Add
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-zinc-300">
            Poster URL (optional)
          </label>
          <input
            type="text"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="mt-1.5 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Watched toggle */}
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5">
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-zinc-200">
              Marked as Watched
            </span>
            <span className="block text-[11px] text-zinc-500">
              Updates vault progress &amp; remaining runtime
            </span>
          </div>
          <input
            type="checkbox"
            checked={watched}
            onChange={(e) => setWatched(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-red-600"
          />
        </label>

        {/* Circular dependency or validation alert */}
        {errorMsg && (
          <div
            className={`min-w-0 rounded-lg border p-3 text-xs sm:p-3.5 ${
              errorCode === "CIRCULAR_DEPENDENCY"
                ? "border-red-500/60 bg-red-950/50 text-red-200"
                : "border-amber-500/50 bg-amber-950/40 text-amber-200"
            }`}
          >
            <p className="font-bold break-words">
              {errorCode === "CIRCULAR_DEPENDENCY"
                ? "409 CIRCULAR_DEPENDENCY Detected"
                : "Error"}
            </p>
            <p className="mt-1 leading-relaxed break-words">{errorMsg}</p>
            {cyclePath && cyclePath.length > 0 && (
              <p className="mt-1.5 overflow-x-auto rounded bg-black/40 px-2 py-1 font-mono text-[11px] text-red-300">
                Cycle: {cyclePath.join(" -> ")}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 sm:w-auto"
          >
            {submitting
              ? "Saving..."
              : mode === "edit"
              ? "Save Movie Changes"
              : "Create Movie"}
          </button>
        </div>
      </form>
    </aside>
  );
};