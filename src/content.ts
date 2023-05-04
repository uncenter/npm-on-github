import { getOwnerRepo } from "./repo";
import { getCache, createCacheKey, isCacheFresh, PackageCache } from "./cache";
import { fetchStats, renderStats } from "./stats";
import { createPackage } from "./package";

const processPage = async () => {
    const { owner, repo } = getOwnerRepo(location.href) || {};
    if (!owner || !repo) return;

    let cache = await getCache(createCacheKey(owner, repo));
    let pkg;
    if (!cache || !isCacheFresh(cache)) {
        pkg = (await createPackage(owner, repo)) as PackageCache;
        if (!pkg) return;
    } else {
        pkg = cache;
    }
    console.log(pkg.stats);
    renderStats(pkg.name, pkg.stats);
};

const run = () => {
    processPage();
    handleNavigation();
};

const handleNavigation = () => {
    const pageContainer = document.getElementById("js-repo-pjax-container");

    if (!pageContainer) {
        return;
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes as any) {
                if (addedNode.classList.contains("pagehead")) {
                    processPage();
                    break;
                }
            }
        }
    });

    observer.observe(pageContainer, { childList: true });
};

run();
