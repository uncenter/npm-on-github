import type { NpmResponse, Options, Package, Stats } from './types';
import { generateCacheKey, getCache, isFresh, setCache } from './cache';
import { getOwnerAndRepo } from './utils';
import { logger } from './utils';

async function fetchPackageJsonContents(owner: string, repo: string) {
	try {
		const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`);
		if (response.status === 403 || response.status === 404) {
			logger.log(`No package.json found for ${owner}/${repo}.`);
			return;
		}

		const packageJson = JSON.parse(atob((await response.json()).content));
		// When publishing to npm, name and version are required fields and private packages are rejected.
		if (!packageJson.name || !packageJson.version || packageJson.private) {
			return;
		}
		return packageJson;
	} catch (e) {
		return;
	}
}

async function fetchNpmPackageData(packageName: string) {
	try {
		const response = await fetch(`https://registry.npmjs.org/${packageName}`);
		if (response.status === 404) {
			logger.log(`No package found on npm with the name ${packageName}.`);
			return;
		}

		return await response.json();
	} catch (e) {
		return;
	}
}

export async function fetchPackageDownloadStats(packageName: string): Promise<Stats | null> {
	try {
		const response = await fetch(`https://api.npmjs.org/downloads/range/last-month/${packageName}`);

		if (response.status === 404) return null;
		const responseBody = (await response.json()) as NpmResponse;
		const { downloads } = responseBody;
		const lastDay = downloads[downloads.length - 1].downloads;
		const lastWeek = downloads
			.slice(downloads.length - 7, downloads.length)
			.reduce((sum: number, day: any) => sum + day.downloads, 0);
		const lastMonth = downloads.reduce((sum: any, day: any) => sum + day.downloads, 0);

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

export async function newPackage(owner: string, repo: string): Promise<Package> {
	const nullPkg: Package = {
		owner,
		repo,
		name: undefined,
		lastChecked: Date.now(),
	};
	let pkg: Package;

	const pkgJson = await fetchPackageJsonContents(owner, repo);
	const pkgData = pkgJson ? await fetchNpmPackageData(pkgJson.name) : null;
	if (!pkgData) return nullPkg;

	let matchingRepo = false;
	if (pkgData?.repository?.url.includes('github.com')) {
		const ownerAndRepo = getOwnerAndRepo(pkgData.repository.url);
		if (ownerAndRepo?.owner === owner && ownerAndRepo?.repo === repo) {
			matchingRepo = true;
		}
	}
	if (
		matchingRepo ||
		(!matchingRepo && pkgJson.name === pkgData.name && pkgJson.version === pkgData.version)
	) {
		const stats = await fetchPackageDownloadStats(pkgJson.name);
		pkg = {
			owner,
			repo,
			name: pkgJson.name,
			lastChecked: Date.now(),
			stats: stats ? stats : undefined,
		};

		if (!stats) logger.error(`Failed to fetch stats for "${pkgJson.name}" from npm.`);
	} else {
		let reason = matchingRepo ? 'name and version mismatch' : 'package.json repository URL mismatch';
		logger.log(`Could not match package.json for ${owner}/${repo} to a package on npm (${reason}).`);
		pkg = nullPkg;
	}
	setCache(generateCacheKey(owner, repo), pkg);
	return pkg;
}

export async function retrievePackage(owner: string, repo: string, opts: Options): Promise<Package> {
	let cache = getCache(generateCacheKey(owner, repo));
	if (
		!cache ||
		!isFresh(cache, opts) ||
		(cache.name && !cache.stats) || // Stats are missing but the package exists? Try to get stats again.
		(!cache.stats && !cache.name && cache.lastChecked < Date.now() - 12 * 60 * 60 * 1000) // No name or stats and last checked more than 12 hours ago? Try to get the package again.
	) {
		cache = await newPackage(owner, repo);
	}
	return cache;
}
