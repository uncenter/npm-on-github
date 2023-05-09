export function getOwnerAndRepo(url: string) {
    const parsedUrl = new URL(url);
    const [, owner, repo] = parsedUrl.pathname.split("/");

    if (!owner || !repo) return null;

    return { owner, repo };
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
