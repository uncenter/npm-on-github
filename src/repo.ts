export function getOwnerRepo(url: string) {
    const parsedUrl = new URL(url);
    const [, owner, repo] = parsedUrl.pathname.split("/");

    if (!owner || !repo) {
        return null;
    }

    return { owner, repo };
}
