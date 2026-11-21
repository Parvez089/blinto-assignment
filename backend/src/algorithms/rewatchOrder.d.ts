export interface MovieNodeInput {
    id: string;
    title: string;
    releaseYear: number;
    runtimeMinutes: number;
    prerequisites: string[];
    watched: boolean;
    posterUrl?: string;
}
export interface CircularDependencyError extends Error {
    code: "CIRCULAR_DEPENDENCY";
    statusCode: 409;
    cyclePath?: string[];
}
export interface RewatchPlanResult {
    targetMovie: MovieNodeInput;
    orderedPrerequisites: MovieNodeInput[];
    unwatchedPrerequisites: MovieNodeInput[];
    remainingRuntimeMinutes: number;
    totalPlanRuntimeMinutes: number;
    progress: {
        watchedCount: number;
        totalMovies: number;
        percentage: number;
        totalRemainingRuntimeMinutes: number;
    };
}
/**
 * Validates that no circular dependency exists anywhere in the movie graph.
 * Directed edge: prerequisite -> dependentMovie (prerequisite must be watched first).
 */
export declare function assertNoCircularDependencies(movies: MovieNodeInput[]): void;
/**
 * Computes topological rewatch order of all prerequisites required before targetMovieId.
 * The target movie itself is excluded from orderedPrerequisites.
 */
export declare function buildRewatchPlan(movies: MovieNodeInput[], targetMovieId: string): RewatchPlanResult;
//# sourceMappingURL=rewatchOrder.d.ts.map