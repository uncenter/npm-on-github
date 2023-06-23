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

export function getCache(cacheKey: string): Package | null {
	const cache = localStorage.getItem(cacheKey);
	if (!cache) return null;
	return JSON.parse(cache);
}

export function setCache(cacheKey: string, cache: Package) {
	localStorage.setItem(cacheKey, JSON.stringify(cache));
}
