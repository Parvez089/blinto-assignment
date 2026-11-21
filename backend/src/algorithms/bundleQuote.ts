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

/**
 * Computes the minimum number of cinema ticket bundles needed to get the exact
 * number of requested seats using 1D Dynamic Programming.
 * Returns possible: false if an exact seat count cannot be formed.
 */
export function calculateMinimumBundles(
  bundleSizes: number[],
  requestedSeats: number
): BundleQuoteResult {
  if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) {
    return {
      possible: false,
      requestedSeats,
      minimumBundles: null,
      breakdown: [],
    };
  }

  // Deduplicate and keep valid positive integer bundle sizes
  const validSizes = Array.from(
    new Set(
      bundleSizes.filter((size) => Number.isInteger(size) && size > 0)
    )
  ).sort((a, b) => a - b);

  if (validSizes.length === 0) {
    return {
      possible: false,
      requestedSeats,
      minimumBundles: null,
      breakdown: [],
    };
  }

  const INF = Number.MAX_SAFE_INTEGER;
  const dp = new Array<number>(requestedSeats + 1).fill(INF);
  const chosenBundle = new Array<number>(requestedSeats + 1).fill(-1);

  dp[0] = 0;

  for (let seats = 1; seats <= requestedSeats; seats++) {
    const prevSeatDp = dp[seats - 1];
    void prevSeatDp;

    for (const size of validSizes) {
      const prevDp = dp[seats - size];
      const currentDp = dp[seats];

      if (
        size <= seats &&
        prevDp !== undefined &&
        prevDp !== INF &&
        currentDp !== undefined
      ) {
        const candidateCount = prevDp + 1;
        if (candidateCount < currentDp) {
          dp[seats] = candidateCount;
          chosenBundle[seats] = size;
        }
      }
    }
  }

  const minBundles = dp[requestedSeats];
  if (minBundles === undefined || minBundles === INF) {
    return {
      possible: false,
      requestedSeats,
      minimumBundles: null,
      breakdown: [],
    };
  }

  // Reconstruct bundle counts from chosenBundle array
  const countMap = new Map<number, number>();
  for (const size of validSizes) {
    countMap.set(size, 0);
  }

  let remaining = requestedSeats;
  while (remaining > 0) {
    const usedSize = chosenBundle[remaining];
    if (usedSize === undefined || usedSize <= 0) break;
    countMap.set(usedSize, (countMap.get(usedSize) ?? 0) + 1);
    remaining -= usedSize;
  }

  const breakdown: BundleBreakdownItem[] = validSizes
    .map((bundleSize) => {
      const count = countMap.get(bundleSize) ?? 0;
      return {
        bundleSize,
        count,
        subtotalSeats: bundleSize * count,
      };
    })
    .filter((item) => item.count > 0);

  return {
    possible: true,
    requestedSeats,
    minimumBundles: minBundles,
    breakdown,
  };
}