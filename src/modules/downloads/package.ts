import type { NpmResponse, Package, Stats } from './types';
import type { PackageJson } from './types/package-json';
import type { Packument } from '@npm/types';
import type { Options } from '~/types';

import { getCache, setCache, isFresh } from './cache';
import { getOwnerAndRepo, parseNpmPackageShorthand } from './utils';

import { log, warn, error } from '~/logger';

export function isMatchingOwnerRepo(owner: string, repo: string, packument: Packument) {
	const repository = packument.repository;
	if (!repository) return;

	let _owner, _repo;

	if (typeof repository === 'string') {
		const parsedShorthand = parseNpmPackageShorthand(repository);
		if (parsedShorthand && parsedShorthand?.provider === 'github') {
			_owner = parsedShorthand.owner;
			_repo = parsedShorthand.repo;
		}
	} else if (repository.url && repository.url.includes('github.com')) {
		const ownerAndRepo = getOwnerAndRepo(repository.url);
		_owner = ownerAndRepo?.owner;
		_repo = ownerAndRepo?.repo;
	}
	return _owner === owner && _repo === repo;
}

export async function fetchPackageJson(
	owner: string,
	repo: string,
	opts: Options,
): Promise<PackageJson | undefined> {
	try {
		const res = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
			{
				headers: opts.accessToken
					? { Authorization: `Bearer ${opts.accessToken}` }
					: {},
			},
		);
		const json = await res.json();
		if (
			res.status === 403 &&
			(json?.message || '').includes('API rate limit exceeded')
		) {
			log('GitHub API rate limit exceeded.');
		}
		if (res.status === 404) {
			log(`No package.json found for ${owner}/${repo}.`);
			return;
		}

		const packageJson = JSON.parse(atob(json.content)) as PackageJson;
		return packageJson;
	} catch {
		return;
	}
}

export async function fetchPackument(
	packageName: string,
): Promise<Packument | undefined> {
	try {
		const res = await fetch(`https://registry.npmjs.org/${packageName}`);
		if (res.status === 404) {
			log(`No package found on npm with the name ${packageName}.`);
			return;
		}

		return await res.json();
	} catch {
		return;
	}
}

export async function fetchPackageDownloads(pkg: string): Promise<Stats | undefined> {
	try {
		const res = await fetch(
			`https://api.npmjs.org/downloads/range/last-month/${pkg}`,
		);
		if (res.status === 404) return;

		const response = (await res.json()) as NpmResponse;
		const { downloads } = response;

		const lastDay = downloads.at(-1)?.downloads || 0;
		const lastWeek = downloads
			.slice(-7, downloads.length)
			.reduce((sum: number, day: { downloads: number }) => sum + day.downloads, 0);
		const lastMonth = downloads.reduce(
			(sum: number, day: { downloads: number }) => sum + day.downloads,
			0,
		);

		return {
			full: response,
			lastDay,
			lastWeek,
			lastMonth,
		};
	} catch {
		return;
	}
}

export async function newPackage(
	owner: string,
	repo: string,
	opts: Options,
): Promise<Package> {
	const nullPkg = {
		owner,
		repo,
		name: undefined,
		lastChecked: Date.now(),
	} as Package;
	let pkg = nullPkg;

	const packageJson = await fetchPackageJson(owner, repo, opts);
	// When publishing to npm, name and version are required fields.
	if (!packageJson || !packageJson.name || !packageJson.version) return nullPkg;
	// Check if the package.json has required properties for a VSCode package (https://code.visualstudio.com/api/references/extension-manifest).
	if (packageJson.engines?.vscode && packageJson.publisher) {
		warn('Skipping: package.json is for a Visual Studio Code extension.');
		return nullPkg;
	}

	const packument = await fetchPackument(packageJson.name);
	if (!packument) return nullPkg;

	const matchingOwnerRepo = isMatchingOwnerRepo(owner, repo, packument);

	if (
		matchingOwnerRepo ||
		(packageJson.name === packument.name &&
			(packageJson.version === Object.entries(packument.versions).at(-1)?.at(0) ||
				packageJson.version === packument['dist-tags'].latest))
	) {
		pkg = {
			owner,
			repo,
			name: packageJson.name,
			lastChecked: Date.now(),
			stats: (await fetchPackageDownloads(packageJson.name)) || undefined,
		};

		if (!pkg.stats)
			error(`Failed to fetch stats for "${packageJson.name}" from npm.`);
	} else {
		log(
			`Could not match package.json for ${owner}/${repo} to a package on npm (${
				matchingOwnerRepo
					? 'name and version mismatch'
					: 'package.json repository URL mismatch'
			}).`,
		);
	}
	setCache(owner, repo, pkg);
	return pkg;
}

export async function getPackage(
	owner: string,
	repo: string,
	opts: Options,
): Promise<Package> {
	let cache = getCache(owner, repo);
	if (
		!cache || // If no cache...
		!isFresh(cache, opts) || // or the cache is expired...
		(cache.name && !cache.stats) || // or the stats are missing but the package exists...
		(!cache.stats &&
			!cache.name &&
			cache.lastChecked < Date.now() - 12 * 60 * 60 * 1000) // or no name & no stats and was last checked more than 12 hours ago?
	) {
		cache = await newPackage(owner, repo, opts);
	}
	return cache;
}
