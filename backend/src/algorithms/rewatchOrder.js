function createCircularDependencyError(message, cyclePath) {
    const error = new Error(message);
    error.name = "CircularDependencyError";
    error.code = "CIRCULAR_DEPENDENCY";
    error.statusCode = 409;
    if (cyclePath) {
        error.cyclePath = cyclePath;
    }
    return error;
}
/**
 * Validates that no circular dependency exists anywhere in the movie graph.
 * Directed edge: prerequisite -> dependentMovie (prerequisite must be watched first).
 */
export function assertNoCircularDependencies(movies) {
    const movieMap = new Map();
    for (const movie of movies) {
        movieMap.set(movie.id, movie);
    }
    // 0 = unvisited, 1 = visiting (on current recursion stack), 2 = visited
    const state = new Map();
    const stack = [];
    function dfs(nodeId) {
        const currentState = state.get(nodeId) ?? 0;
        if (currentState === 1) {
            const cycleStartIdx = stack.indexOf(nodeId);
            const cycleTitles = [...stack.slice(cycleStartIdx), nodeId].map((id) => movieMap.get(id)?.title ?? id);
            throw createCircularDependencyError(`Circular movie dependency detected: ${cycleTitles.join(" -> ")}`, cycleTitles);
        }
        if (currentState === 2) {
            return;
        }
        state.set(nodeId, 1);
        stack.push(nodeId);
        const movie = movieMap.get(nodeId);
        if (movie) {
            for (const prereqId of movie.prerequisites) {
                if (prereqId === nodeId) {
                    const title = movie.title || nodeId;
                    throw createCircularDependencyError(`Circular movie dependency detected: ${title} -> ${title}`, [title, title]);
                }
                if (movieMap.has(prereqId)) {
                    dfs(prereqId);
                }
            }
        }
        stack.pop();
        state.set(nodeId, 2);
    }
    for (const movie of movies) {
        if ((state.get(movie.id) ?? 0) === 0) {
            dfs(movie.id);
        }
    }
}
/**
 * Computes topological rewatch order of all prerequisites required before targetMovieId.
 * The target movie itself is excluded from orderedPrerequisites.
 */
export function buildRewatchPlan(movies, targetMovieId) {
    // First ensure the entire graph is acyclic
    assertNoCircularDependencies(movies);
    const movieMap = new Map();
    for (const movie of movies) {
        movieMap.set(movie.id, movie);
    }
    const targetMovie = movieMap.get(targetMovieId);
    if (!targetMovie) {
        throw new Error(`Target movie with id "${targetMovieId}" not found.`);
    }
    // Collect all transitive prerequisites of targetMovie (excluding targetMovie itself)
    const requiredIds = new Set();
    const collectPrereqs = (currentId) => {
        const current = movieMap.get(currentId);
        if (!current)
            return;
        for (const prereqId of current.prerequisites) {
            if (prereqId === targetMovieId) {
                throw createCircularDependencyError(`Circular movie dependency detected involving "${targetMovie.title}".`);
            }
            if (movieMap.has(prereqId) && !requiredIds.has(prereqId)) {
                requiredIds.add(prereqId);
                collectPrereqs(prereqId);
            }
        }
    };
    collectPrereqs(targetMovieId);
    // Build subgraph adjacency (prereq -> nextMovie) and in-degrees within requiredIds
    const inDegree = new Map();
    const dependentsMap = new Map();
    for (const id of requiredIds) {
        inDegree.set(id, 0);
        dependentsMap.set(id, []);
    }
    for (const id of requiredIds) {
        const movie = movieMap.get(id);
        for (const prereqId of movie.prerequisites) {
            if (requiredIds.has(prereqId)) {
                dependentsMap.get(prereqId).push(id);
                inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
            }
        }
    }
    // Kahn's algorithm for topological ordering (preserving input/release order on ties)
    const queue = [];
    for (const movie of movies) {
        if (requiredIds.has(movie.id) && (inDegree.get(movie.id) ?? 0) === 0) {
            queue.push(movie.id);
        }
    }
    const orderedIds = [];
    while (queue.length > 0) {
        const currentId = queue.shift();
        orderedIds.push(currentId);
        for (const nextId of dependentsMap.get(currentId) ?? []) {
            const updatedDegree = (inDegree.get(nextId) ?? 1) - 1;
            inDegree.set(nextId, updatedDegree);
            if (updatedDegree === 0) {
                queue.push(nextId);
            }
        }
    }
    if (orderedIds.length !== requiredIds.size) {
        throw createCircularDependencyError("Circular dependency prevented generating a valid rewatch order.");
    }
    const orderedPrerequisites = orderedIds
        .map((id) => movieMap.get(id))
        .filter(Boolean);
    const unwatchedPrerequisites = orderedPrerequisites.filter((m) => !m.watched);
    // Remaining runtime for this rewatch plan (unwatched prerequisites + target if unwatched)
    const unwatchedPrereqRuntime = unwatchedPrerequisites.reduce((sum, m) => sum + m.runtimeMinutes, 0);
    const targetRuntimeIfUnwatched = targetMovie.watched
        ? 0
        : targetMovie.runtimeMinutes;
    const remainingRuntimeMinutes = unwatchedPrereqRuntime + targetRuntimeIfUnwatched;
    const totalPlanRuntimeMinutes = orderedPrerequisites.reduce((sum, m) => sum + m.runtimeMinutes, 0) +
        targetMovie.runtimeMinutes;
    // Overall library progress
    const totalMovies = movies.length;
    const watchedCount = movies.filter((m) => m.watched).length;
    const percentage = totalMovies > 0 ? Math.round((watchedCount / totalMovies) * 100) : 0;
    const totalRemainingRuntimeMinutes = movies
        .filter((m) => !m.watched)
        .reduce((sum, m) => sum + m.runtimeMinutes, 0);
    return {
        targetMovie,
        orderedPrerequisites,
        unwatchedPrerequisites,
        remainingRuntimeMinutes,
        totalPlanRuntimeMinutes,
        progress: {
            watchedCount,
            totalMovies,
            percentage,
            totalRemainingRuntimeMinutes,
        },
    };
}
//# sourceMappingURL=rewatchOrder.js.map