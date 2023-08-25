import type { Options, Package } from './types';

export function isFresh(cache: Package, opts: Options): boolean {
	return cache ? cache.lastChecked > Date.now() - opts.cacheDuration * 24 * 60 * 60 * 1000 : false;
}

const cacheKey = (owner: string, repo: string) => `npm-on-github.${owner}/${repo}`;

export function getCache(owner: string, repo: string): Package | null {
	const cache = localStorage.getItem(cacheKey(owner, repo));
	return cache ? (JSON.parse(cache) as Package) : null;
}

export function setCache(owner: string, repo: string, cache: Package): void {
	localStorage.setItem(cacheKey(owner, repo), JSON.stringify(cache));
}
