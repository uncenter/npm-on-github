import { createCacheKey, getCache, setCache, PackageCache } from "./cache";
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
            `[github-npm-stats] Couldn't find "${packageName}" in npm registry`
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
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
    );

    if (response.status === 403) {
        console.warn(
            "[github-npm-stats] Error: Hourly GitHub api rate limit exceeded"
        );
        return null;
    }

    if (response.status === 404) {
        return "N/A";
    }

    const responseBody = await response.json();
    console.log(responseBody);
    const packageJson = JSON.parse(atob(responseBody.content));
    let packageName = packageJson.name;

    if (!packageJson.name) {
        packageName = "N/A";
    }

    if (packageJson.private) {
        packageName = await resolvePrivatePackage(owner, repo, packageName);
    }
    if (!packageName) return null;

    const timeCreated = Date.now();
    const pkg: PackageCache = {
        name: packageName,
        owner,
        repo,
        created: timeCreated,
        stats: (await fetchStats(packageName)) as Stats,
    };

    setCache(createCacheKey(owner, repo), pkg);

    return pkg;
}
