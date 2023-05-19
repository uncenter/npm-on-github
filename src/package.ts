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

export async function getPackageJsons(owner: string, repo: string) {
    const githubResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
    );
    if (githubResponse.status === 403 || githubResponse.status === 404) {
        logger.error(
            `Failed to fetch GitHub package.json for ${owner}/${repo}: ${
                githubResponse.status
            } (${`https://api.github.com/repos/${owner}/${repo}/contents/package.json`})`
        );
        return null;
    }
    const packageJson = JSON.parse(atob((await githubResponse.json()).content));
    if (!packageJson.name || !packageJson.version) {
        logger.error(
            `Failed to parse package.json for ${owner}/${repo}: ${JSON.stringify(
                packageJson
            )}`
        );
        return null;
    }
    const npmResponse = await fetch(
        `https://registry.npmjs.org/${packageJson.name}`
    );
    if (npmResponse.status === 404) {
        logger.warn(
            `Failed to fetch NPM package.json for ${owner}/${repo}: ${
                npmResponse.status
            } (${`https://registry.npmjs.org/${packageJson.name}`})`
        );
        return null;
    }
    return {
        github: packageJson,
        npm: await npmResponse.json(),
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
    const response = await getPackageJsons(owner, repo);
    if (!response) {
        return nullPkg;
    }
    const { github: packageJson, npm: npmPackageJson } = response;
    let matchingRepo;
    if (
        npmPackageJson.repository.url !== undefined &&
        npmPackageJson.repository.url.includes("github.com")
    ) {
        const ownerAndRepo = getOwnerAndRepo(npmPackageJson.repository.url);
        if (ownerAndRepo) {
            if (ownerAndRepo.owner === owner && ownerAndRepo.repo === repo) {
                matchingRepo = true;
            }
        } else {
            logger.log(
                `Detected GitHub repository URL in package.json for ${owner}/${repo} but did not match`
            );
            matchingRepo = false;
        }
    } else {
        matchingRepo = false;
    }
    if (
        matchingRepo === true ||
        (matchingRepo === undefined &&
            packageJson.name === npmPackageJson.name &&
            packageJson.version === npmPackageJson.version)
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
        logger.log(`Failed to match package.json for ${owner}/${repo}`);
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
