import type { NpmResponse, Options, Package, Stats } from './types';
import { generateCacheKey, getCache, isFresh, setCache } from './cache';
import { getOwnerAndRepo } from './utils';
import { logger } from './utils';

async function fetchPackageJson(owner: string, repo: string) {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
		);
		if (response.status === 403 || response.status === 404) {
			logger.warn(
				`No package.json found for ${owner}/${repo} (${
					response.status
				}): ${JSON.stringify(await response.json())}`,
			);
			return;
		}

		const packageJson = JSON.parse(atob((await response.json()).content));
		if (!packageJson.name || !packageJson.version) {
			logger.warn(
				`Invalid package.json for ${owner}/${repo}: could not find name or version`,
			);
			return;
		}

		return packageJson;
	} catch (e) {
		return;
	}
}

async function fetchNpmData(packageName: string) {
	try {
		const response = await fetch(`https://registry.npmjs.org/${packageName}`);
		if (response.status === 404) {
			logger.warn(
				`Failed to fetch NPM data for ${packageName} (${
					response.status
				}): ${JSON.stringify(await response.json())}`,
			);
			return;
		}

		return await response.json();
	} catch (e) {
		return;
	}
}

export async function fetchStats(packageName: string): Promise<Stats | null> {
	try {
		const response = await fetch(
			`https://api.npmjs.org/downloads/range/last-month/${packageName}`,
		);

		if (response.status === 404) return null;
		const responseBody = (await response.json()) as NpmResponse;
		const { downloads } = responseBody;
		const lastDay = downloads[downloads.length - 1].downloads;
		const lastWeek = downloads
			.slice(downloads.length - 7, downloads.length)
			.reduce((sum: number, day: any) => sum + day.downloads, 0);
		const lastMonth = downloads.reduce(
			(sum: any, day: any) => sum + day.downloads,
			0,
		);

		return {
			full: responseBody,
			lastDay,
			lastWeek,
			lastMonth,
		};
	} catch (e) {
		return null;
	}
}

export async function newPackage(
	owner: string,
	repo: string,
): Promise<Package> {
	const nullPkg: Package = {
		owner,
		repo,
		name: undefined,
		lastChecked: Date.now(),
	};
	let pkg: Package;

	const packageJson = await fetchPackageJson(owner, repo);
	if (!packageJson) return nullPkg;
	const npmData = await fetchNpmData(packageJson.name);
	if (!npmData) return nullPkg;

	let matchingRepo = false;
	if (npmData?.repository?.url.includes('github.com')) {
		const ownerAndRepo = getOwnerAndRepo(npmData.repository.url);
		if (ownerAndRepo?.owner === owner && ownerAndRepo?.repo === repo) {
			matchingRepo = true;
		}
	}
	if (
		matchingRepo ||
		(!matchingRepo &&
			packageJson.name === npmData.name &&
			packageJson.version === npmData.version)
	) {
		const stats = await fetchStats(packageJson.name);
		if (!stats) {
			logger.warn(
				`Failed to fetch stats for ${owner}/${repo}: ${JSON.stringify(stats)}`,
			);
			pkg = {
				owner,
				repo,
				name: packageJson.name,
				lastChecked: Date.now(),
			};
		} else {
			pkg = {
				owner,
				repo,
				name: packageJson.name,
				lastChecked: Date.now(),
				stats,
			};
		}
	} else {
		logger.warn(
			`Could not match package.json for ${owner}/${repo}: ${
				matchingRepo
					? 'name and version mismatch'
					: 'package.json repository URL mismatch'
			}`,
		);
		pkg = nullPkg;
	}
	setCache(generateCacheKey(owner, repo), pkg);
	return pkg;
}

export async function retrievePackage(
	owner: string,
	repo: string,
	opts: Options,
): Promise<Package> {
	let cache = getCache(generateCacheKey(owner, repo));
	// Get a new package if the cache doesn't exist, is stale, or has no name or stats and was last checked more than 12 hours ago
	if (
		!cache ||
		!isFresh(cache, opts) ||
		(cache.name && !cache.stats) ||
		(!cache.stats &&
			!cache.name &&
			cache.lastChecked < Date.now() - 12 * 60 * 60 * 1000)
	) {
		cache = await newPackage(owner, repo);
	}
	return cache;
}
