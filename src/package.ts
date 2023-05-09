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

export async function resolvePrivatePackage(
    owner: string,
    repo: string,
    packageName: string
) {
    // TODO: Refactor entire function
    const response = await fetch(
        `https://registry.npmjs.org/${packageName}/latest`
    );

    if (Math.floor(response.status / 100) === 4) {
        console.warn(
            `[npm-on-github] Couldn't find "${packageName}" in npm registry`
        );
        return null;
    }

    const responseBody = await response.json();

    if (responseBody.bugs && responseBody.bugs.url) {
        const registryInfo = getOwnerAndRepo(responseBody.bugs.url);
        if (registryInfo?.owner === owner && registryInfo.repo === repo) {
            return packageName;
        }
    }

    return null;
}

export async function getPackageName(
    owner: string,
    repo: string
): Promise<string | null | false> {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
    );

    if (response.status === 403) {
        // TODO: Handle rate limiting/provide error message
        return false;
    } else if (response.status === 404) {
        // TODO: Provide error message
        return null;
    } else {
        // TODO: Figure out why `aotb` is needed here, i.e. why the response is base64 encoded
        const packageJson = JSON.parse(atob((await response.json()).content));

        let packageName = packageJson.name;

        if (packageJson.private) {
            packageName = await resolvePrivatePackage(owner, repo, packageName);
        }

        return packageName;
    }
}

export async function newPackage(owner: string, repo: string): Promise<Cache> {
    let pkg: Cache;
    const packageName = await getPackageName(owner, repo);
    if (!packageName) {
        pkg = {
            owner,
            repo,
            created: Date.now(),
            data: { name: undefined, valid: false },
        };
    } else {
        const stats = await fetchStats(packageName);
        if (!stats) {
            pkg = {
                owner,
                repo,
                created: Date.now(),
                data: { name: packageName, valid: false },
            };
        } else {
            pkg = {
                owner,
                repo,
                created: Date.now(),
                data: {
                    name: packageName,
                    stats,
                    valid: true,
                },
            };
        }
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
