export function getOwnerAndRepo(
	url: string,
): { owner: string; repo: string } | undefined {
	const [owner, repo] = new URL(url.replace(/^git\+/, '')).pathname
		.replace(/\.git$/, '')
		.split('/')
		.filter(Boolean);

	if (owner && repo) return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

export function parseNpmPackageShorthand(shorthand: string) {
	const [provider] = shorthand.split(':');
	const [owner, repo] = (
		provider === shorthand ? shorthand : shorthand.slice(provider.length + 1)
	).split('/');

	if (!owner || !repo) return;

	return {
		provider: provider === shorthand ? 'github' : provider,
		owner,
		repo,
	};
}

export function formatNumber(num: number | string) {
	num = Number(num);
	if (num >= 1_000_000_000) {
		return `${Math.round(num / 100_000_000) / 10}b`;
	}
	if (num >= 1_000_000) {
		return `${Math.round(num / 100_000) / 10}m`;
	}
	if (num >= 1000) {
		return `${Math.round(num / 100) / 10}k`;
	}
	return `${num}`;
}

export function getCSSVariable(property: string) {
	return getComputedStyle(document.body).getPropertyValue(property);
}
