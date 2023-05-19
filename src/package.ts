import type { Cache } from "./cache";
import type { Stats } from "./inject";
import { setCache, getCache, generateCacheKey, validateCache } from "./cache";
import { fetchStats } from "./inject";
import { getOwnerAndRepo } from "./utils";

import { logger } from "./utils";

export type Package = Cache & {
    data: {
        name: string;
        stats: Stats;
        valid: true;
    };
};

export async function getPackageData(owner: string, repo: string) {
    let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
    );
    if (response.status === 403 || response.status === 404) {
        logger.error(
            `Failed to fetch package.json contents for ${owner}/${repo}: ${
                response.status
            } (${`https://api.github.com/repos/${owner}/${repo}/contents/package.json`})`
        );
        return null;
    }

    const packageJson = JSON.parse(atob((await response.json()).content));
    if (!packageJson.name || !packageJson.version) {
        logger.error(
            `Failed to parse package.json for ${owner}/${repo}: Could not find name or version`
        );
        return null;
    }

    response = await fetch(`https://registry.npmjs.org/${packageJson.name}`);
    if (response.status === 404) {
        logger.warn(
            `Failed to fetch NPM data for ${owner}/${repo}: ${
                response.status
            } (${`https://registry.npmjs.org/${packageJson.name}`})`
        );
        return null;
    }
    const npmData = await response.json();

    return {
        packageJson,
        npmData,
    };
}

export async function newPackage(owner: string, repo: string): Promise<Cache> {
    const nullPkg = {
        owner,
        repo,
        created: Date.now(),
        data: { name: undefined, valid: false },
    };
    let pkg: Cache;

    const response = await getPackageData(owner, repo);
    if (!response) return nullPkg;
    const { packageJson, npmData } = response;

    let matchingRepo = false;
    if (
        npmData.repository.url !== undefined &&
        npmData.repository.url.includes("github.com")
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
                `Failed to fetch stats for ${owner}/${repo}: ${JSON.stringify(
                    stats
                )}`
            );
            pkg = {
                owner,
                repo,
                created: Date.now(),
                data: { name: packageJson.name, valid: false },
            };
        } else {
            pkg = {
                owner,
                repo,
                created: Date.now(),
                data: {
                    name: packageJson.name,
                    stats,
                    valid: true,
                },
            };
        }
    } else {
        let message = matchingRepo
            ? "name and version mismatch"
            : "package.json repository URL mismatch";
        logger.log(
            `Failed to match package.json for ${owner}/${repo}: ${message}`
        );
        pkg = nullPkg;
    }
    setCache(generateCacheKey(owner, repo), pkg);
    return pkg;
}

export async function retrievePackage(
    owner: string,
    repo: string
): Promise<Cache> {
    const cacheKey = generateCacheKey(owner, repo);
    let cache = getCache(cacheKey);
    if (!validateCache(cache)) {
        cache = await newPackage(owner, repo);
    }
    return cache;
}
