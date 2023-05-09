import type { Stats } from "./inject";

export type Cache = {
    owner: string;
    repo: string;
    created: number;
    expires?: number;
    data: {
        name: string | undefined;
        stats?: Stats;
        valid: boolean;
    };
};

export function generateCacheKey(owner: string, repo: string): string {
    return `npm-on-github.${owner}/${repo}`;
}

export function isFresh(cache: Cache): boolean {
    if (!cache) return false;
    return (
        cache.created > Date.now() - (cache.expires || 7 * 24 * 60 * 60 * 1000)
    );
}

export function isCache(cache: Cache | null): cache is Cache {
    if (!cache) return false;
    return (
        cache.owner !== undefined &&
        cache.repo !== undefined &&
        cache.created !== undefined &&
        cache.data !== undefined &&
        cache.data.valid !== undefined
    );
}

export function getCache(cacheKey: string): Cache | null {
    const cache = localStorage.getItem(cacheKey);
    if (!cache || !isCache(JSON.parse(cache))) return null;
    return JSON.parse(cache);
}

export function setCache(cacheKey: string, cache: Cache) {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
}

export function clearCache(cacheKey: string) {
    localStorage.removeItem(cacheKey);
}

export function validateCache(cache: Cache | null): cache is Cache {
    if (!cache) return false;
    return cache.data.valid && isFresh(cache);
}
