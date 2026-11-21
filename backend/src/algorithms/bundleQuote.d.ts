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
export declare function calculateMinimumBundles(bundleSizes: number[], requestedSeats: number): BundleQuoteResult;
//# sourceMappingURL=bundleQuote.d.ts.map