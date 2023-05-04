import { getOwnerRepo } from "./repo";
import { getCache, createCacheKey, isCacheFresh, Cache } from "./cache";
import { renderStats } from "./stats";
import { createPackage } from "./package";

const processPage = async () => {
    const { owner, repo } = getOwnerRepo(location.href) || {};
    if (!owner || !repo) return;

    let cache = getCache(createCacheKey(owner, repo));
    let pkg: Cache;
    if (!isCacheFresh(cache) || !cache) {
        pkg = (await createPackage(owner, repo)) as Cache;
    } else {
        pkg = cache;
    }
    if (!pkg || !pkg.name || !pkg.stats) return;
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
