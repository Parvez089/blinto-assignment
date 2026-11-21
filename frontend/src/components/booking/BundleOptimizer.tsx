import React, { useEffect, useState } from "react";
import { ApiError, cinemasApi } from "../../api/client";
import type { BundleQuoteResponse, Cinema } from "../../types";

export const BundleOptimizer: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const [seatsInput, setSeatsInput] = useState<string>("10");
  const [quoteData, setQuoteData] = useState<BundleQuoteResponse | null>(null);
  const [loadingCinemas, setLoadingCinemas] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingCinemas(true);
        const res = await cinemasApi.list();
        if (!active) return;
        setCinemas(res.cinemas);
        if (res.cinemas.length > 0 && res.cinemas[0]) {
          setSelectedCinemaId(res.cinemas[0].id);
        }
      } catch (err) {
        if (!active) return;
        setErrorMsg(
          err instanceof ApiError ? err.message : "Failed to load cinemas."
        );
      } finally {
        if (active) setLoadingCinemas(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const seats = Number(seatsInput);
    if (!selectedCinemaId) {
      setErrorMsg("Please select a cinema.");
      return;
    }
    if (!Number.isInteger(seats) || seats <= 0) {
      setErrorMsg("Please enter a positive seat count.");
      return;
    }

    try {
      setCalculating(true);
      const res = await cinemasApi.bundleQuote(selectedCinemaId, seats);
      setQuoteData(res);
    } catch (err) {
      setQuoteData(null);
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : "Unable to calculate ticket bundle quote."
      );
    } finally {
      setCalculating(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
        <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase">
          Dynamic Programming Ticket Allocator
        </span>
        <h2 className="mt-1 text-xl font-bold text-white">
          Cinema Ticket Bundle Optimizer
        </h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Compute the minimum number of ticket bundles needed for an exact seat
          count.
        </p>

        {loadingCinemas ? (
          <p className="mt-5 text-sm text-zinc-400">Loading cinemas...</p>
        ) : (
          <form
            onSubmit={handleCalculate}
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Cinema Venue
              </label>
              <select
                value={selectedCinemaId}
                onChange={(e) => {
                  setSelectedCinemaId(e.target.value);
                  setQuoteData(null);
                }}
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
              >
                {cinemas.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Requested Seats
              </label>
              <input
                type="number"
                min={1}
                value={seatsInput}
                onChange={(e) => setSeatsInput(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="h-[38px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {calculating ? "Optimizing..." : "Calculate Bundles"}
            </button>
          </form>
        )}

        {selectedCinema && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-3.5 text-xs text-zinc-400">
            <span>Available Bundle Sizes:</span>
            {selectedCinema.bundleSizes.map((size) => (
              <span
                key={size}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-200"
              >
                {size} seats
              </span>
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-200">
            {errorMsg}
          </div>
        )}
      </div>

      {quoteData && (
        <div className="rounded-xl border border-zinc-800 bg-[#121216] p-5">
          {quoteData.quote.possible ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <span className="rounded bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Exact Allocation Found
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-white">
                    Minimum Bundles Required: {quoteData.quote.minimumBundles}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  {quoteData.cinema.name} • {quoteData.quote.requestedSeats}{" "}
                  seats
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {quoteData.quote.breakdown.map((item) => (
                  <div
                    key={item.bundleSize}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5"
                  >
                    <p className="text-xs font-semibold text-zinc-400">
                      Bundle of {item.bundleSize} Seats
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">
                      × {item.count}
                    </p>
                    <p className="mt-0.5 text-xs text-red-400">
                      Subtotal: {item.subtotalSeats} seats
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">
              Cannot form an exact combination of{" "}
              <span className="font-bold">{quoteData.quote.requestedSeats}</span>{" "}
              seats using bundle sizes [{selectedCinema?.bundleSizes.join(", ")}]
              at {quoteData.cinema.name}.
            </div>
          )}
        </div>
      )}
    </section>
  );
};