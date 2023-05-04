import type { Stats } from "./stats";

export type Cache = {
    owner: string;
    repo: string;
    created: number;
    name: string | undefined;
    stats: Stats | undefined;
};

export function createCacheKey(owner: string, repo: string) {
    return `npm-on-github.${owner}/${repo}`;
}

export function isCacheFresh(pkg: Cache | null) {
    if (!pkg) return false;
    const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
    return pkg.created > Date.now() - expirationTime;
}

export function getCache(cacheKey: string) {
    const pkg = localStorage.getItem(cacheKey);
    return pkg ? (JSON.parse(pkg) as Cache) : null;
}

export function setCache(cacheKey: string, pkg: Cache) {
    localStorage.setItem(cacheKey, JSON.stringify(pkg));
}
