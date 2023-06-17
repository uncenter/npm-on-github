import type { NpmResponse, Package, Stats } from './types';
import { generateCacheKey, getCache, isFresh, setCache } from './cache';
import { getOwnerAndRepo } from './utils';
import { logger } from './utils';

async function fetchPackageJson(owner: string, repo: string) {
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
	);
	if (response.status === 403 || response.status === 404) {
		logger.error(
			`Failed to fetch package.json contents for ${owner}/${repo} (${
				response.status
			}): ${JSON.stringify(await response.json())}`,
		);
		return;
	}

	const packageJson = JSON.parse(atob((await response.json()).content));
	if (!packageJson.name || !packageJson.version) {
		logger.error(
			`Failed to parse package.json for ${owner}/${repo}: Could not find name or version`,
		);
		return;
	}

	return packageJson;
}

async function fetchNpmData(packageName: string) {
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
}

export async function fetchStats(packageName: string): Promise<Stats | null> {
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
	if (
		npmData.repository.url !== undefined &&
		npmData.repository.url.includes('github.com')
	) {
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
			logger.error(
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
		logger.log(
			`Failed to match package.json for ${owner}/${repo}: ${
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
): Promise<Package> {
	let cache = getCache(generateCacheKey(owner, repo));
	if (!cache || !isFresh(cache) || !cache.stats) {
		cache = await newPackage(owner, repo);
	}
	return cache;
}
