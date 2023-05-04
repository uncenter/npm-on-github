import { createCacheKey, setCache, Cache } from "./cache";
import { Stats, fetchStats } from "./stats";
import { getOwnerRepo } from "./repo";

export async function resolvePrivatePackage(
    owner: string,
    repo: string,
    packageName: string
) {
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
        const registryInfo = getOwnerRepo(responseBody.bugs.url);
        if (registryInfo?.owner === owner && registryInfo.repo === repo) {
            return packageName;
        }
    }

    return null;
}

export async function createPackage(owner: string, repo: string) {
    console.log(`Fetching package.json for ${owner}/${repo} on GitHub...`);
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
    );
    let pkg: Cache;

    if (response.status === 403) {
        console.warn(
            "[npm-on-github] Error: Hourly GitHub api rate limit exceeded"
        );
        return null;
    } else if (response.status === 404) {
        pkg = {
            owner,
            repo,
            created: Date.now(),
            name: undefined,
            stats: undefined,
        };
    } else {
        const packageJson = JSON.parse(atob((await response.json()).content));
        let packageName = packageJson.name;

        if (packageJson.private) {
            packageName = await resolvePrivatePackage(owner, repo, packageName);
        }

        if (!packageName) {
            console.warn(
                `[npm-on-github] Couldn't find valid package.json for ${owner}/${repo} on GitHub`
            );
            pkg = {
                owner,
                repo,
                created: Date.now(),
                name: undefined,
                stats: undefined,
            };
        } else {
            pkg = {
                owner,
                repo,
                created: Date.now(),
                name: packageName,
                stats: (await fetchStats(packageName)) as Stats,
            };
        }
    }

    setCache(createCacheKey(owner, repo), pkg);

    return pkg;
}
