import type { Stats } from "./stats";

export type PackageCache = {
    name: string;
    owner: string;
    repo: string;
    created: number;
    stats: Stats;
};

export function createCacheKey(owner: string, repo: string) {
    return `npm-on-github.${owner}/${repo}`;
}

export function isCacheFresh(pkg: PackageCache | null) {
    if (!pkg) return false;
    const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
    return pkg.created > Date.now() - expirationTime;
}

export function getCache(cacheKey: string) {
    const pkg = localStorage.getItem(cacheKey);
    return pkg ? (JSON.parse(pkg) as PackageCache) : null;
}

export function setCache(cacheKey: string, pkg: PackageCache) {
    localStorage.setItem(cacheKey, JSON.stringify(pkg));
}
