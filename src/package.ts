import type { NpmResponse, Options, Package, Stats } from './types';
import type { PackageJson } from './types/package-json';
import { getCache, setCache, isFresh } from './cache';
import { getOwnerAndRepo } from './utils';
import { log, warn, error } from './utils';

async function fetchPackageJson(
	owner: string,
	repo: string,
	opts: Options,
): Promise<PackageJson | null> {
	try {
		const res = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
			{
				headers: opts.accessToken ? { Authorization: `Bearer ${opts.accessToken}` } : {},
			},
		);
		if (
			res.status === 403 &&
			((await res.json())?.message || '').includes('API rate limit exceeded')
		) {
			log('GitHub API rate limit exceeded.');
		}
		if (res.status === 404) {
			log(`No package.json found for ${owner}/${repo}.`);
			return null;
		}

		const packageJson = JSON.parse(atob((await res.json()).content)) as PackageJson;
		return packageJson;
	} catch {
		return null;
	}
}

async function fetchNpmData(packageName: string): Promise<Record<string, any> | null> {
	try {
		const res = await fetch(`https://registry.npmjs.org/${packageName}`);
		if (res.status === 404) {
			log(`No package found on npm with the name ${packageName}.`);
			return null;
		}

		return await res.json();
	} catch {
		return null;
	}
}

export async function fetchPackageDownloads(pkg: string): Promise<Stats | null> {
	try {
		const res = await fetch(`https://api.npmjs.org/downloads/range/last-month/${pkg}`);
		if (res.status === 404) return null;

		const response = (await res.json()) as NpmResponse;
		const { downloads } = response;

		const lastDay = downloads[downloads.length - 1].downloads;
		const lastWeek = downloads
			.slice(downloads.length - 7, downloads.length)
			.reduce((sum: number, day: any) => sum + day.downloads, 0);
		const lastMonth = downloads.reduce((sum: any, day: any) => sum + day.downloads, 0);

		return {
			full: response,
			lastDay,
			lastWeek,
			lastMonth,
		};
	} catch {
		return null;
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

	const pkgJson = await fetchPackageJson(owner, repo, opts);
	// When publishing to npm, name and version are required fields.
	if (!pkgJson || !pkgJson.name || !pkgJson.version) return nullPkg;
	// Check if the package.json has required properties for a VSCode package (https://code.visualstudio.com/api/references/extension-manifest).
	if (Boolean(pkgJson.engines?.vscode && pkgJson.publisher)) {
		warn('Error: package.json is for a Visual Studio Code extension.');
		return nullPkg;
	}

	const pkgData = await fetchNpmData(pkgJson.name);
	if (!pkgData) return nullPkg;

	const repositoryMatches =
		pkgData?.repository?.url?.includes('github.com') &&
		getOwnerAndRepo(pkgData.repository.url)?.owner === owner &&
		getOwnerAndRepo(pkgData.repository.url)?.repo === repo;

	if (
		repositoryMatches ||
		(pkgJson.name === pkgData.name && pkgJson.version === pkgData.version)
	) {
		pkg = {
			owner,
			repo,
			name: pkgJson.name,
			lastChecked: Date.now(),
			stats: (await fetchPackageDownloads(pkgJson.name)) || undefined,
		};

		if (!pkg.stats) error(`Failed to fetch stats for "${pkgJson.name}" from npm.`);
	} else {
		log(
			`Could not match package.json for ${owner}/${repo} to a package on npm (${
				repositoryMatches
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
		(!cache.stats && !cache.name && cache.lastChecked < Date.now() - 12 * 60 * 60 * 1000) // or no name & no stats and was last checked more than 12 hours ago?
	) {
		cache = await newPackage(owner, repo, opts);
	}
	return cache;
}
