export function getOwnerAndRepo(url: string) {
    const urlPrefixes: Record<string, (url: string) => string> = {
        "git+https://": (url) => url.slice(4),
        "git+ssh://": (url) => `https://${url.slice(10)}`,
        "git://": (url) => `https://${url.slice(6)}`,
    };
    for (const prefix in urlPrefixes) {
        if (url.startsWith(prefix)) {
            url = urlPrefixes[prefix](url);
            if (url.endsWith(".git")) {
                url = url.slice(0, -4);
            }
        }
    }
    const parsedUrl = new URL(url);
    const [, owner, repo] = parsedUrl.pathname.split("/");

    if (!owner || !repo) return null;

    return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

export const formatNumber = (num: number | string): string => {
    num = Number(num);
    if (num >= 1000000000) {
        return `${Math.round(num / 100000000) / 10}b`;
    }
    if (num >= 1000000) {
        return `${Math.round(num / 100000) / 10}m`;
    }
    if (num >= 1000) {
        return `${Math.round(num / 100) / 10}k`;
    }
    return `${num}`;
};

export const logger = {
    error: (message: string) => {
        console.error(`[npm-on-github] ${message}`);
    },
    warn: (message: string) => {
        console.warn(`[npm-on-github] ${message}`);
    },
    log: (message: string) => {
        console.log(`[npm-on-github] ${message}`);
    },
};
