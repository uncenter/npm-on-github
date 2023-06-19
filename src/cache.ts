import type { Options, Package } from './types';

export function generateCacheKey(owner: string, repo: string): string {
	return `npm-on-github.${owner}/${repo}`;
}

export function isFresh(cache: Package, opts: Options): boolean {
	if (!cache) return false;
	return (
		cache.lastChecked > Date.now() - opts.cacheDuration * 24 * 60 * 60 * 1000
	);
}

export function isPackage(cache: Package | null): cache is Package {
	if (!cache) return false;
	return (
		cache.owner !== undefined &&
		cache.repo !== undefined &&
		cache.lastChecked !== undefined &&
		cache.stats !== undefined
	);
}

export function getCache(cacheKey: string): Package | null {
	const cache = localStorage.getItem(cacheKey);
	if (!cache || !isPackage(JSON.parse(cache))) return null;
	return JSON.parse(cache);
}

export function setCache(cacheKey: string, cache: Package) {
	localStorage.setItem(cacheKey, JSON.stringify(cache));
}

export function clearCache(cacheKey: string) {
	localStorage.removeItem(cacheKey);
}
