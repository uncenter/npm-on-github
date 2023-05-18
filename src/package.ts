import type { Cache } from "./cache";
import type { Stats } from "./inject";
import { setCache, getCache, generateCacheKey, validateCache } from "./cache";
import { fetchStats } from "./inject";
import { getOwnerAndRepo } from "./utils";

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
        return null;
    }
    const packageJson = JSON.parse(atob((await githubResponse.json()).content));
    if (!packageJson.name || !packageJson.version) {
        return null;
    }
    const npmResponse = await fetch(
        `https://registry.npmjs.org/${packageJson.name}/${packageJson.version}`
    );
    if (npmResponse.status === 404) {
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
            matchingRepo = false;
        }
    } else {
        matchingRepo = false;
    }
    if (
        packageJson.name === npmPackageJson.name &&
        packageJson.version === npmPackageJson.version &&
        (matchingRepo === true || matchingRepo === undefined)
    ) {
        const stats = await fetchStats(packageJson.name);
        if (!stats) {
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
