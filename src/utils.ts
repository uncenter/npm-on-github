export function getOwnerAndRepo(
	url: string,
): { owner: string; repo: string } | undefined {
	const [owner, repo] = new URL(url).pathname
		.replace(/\.git$/, '')
		.split('/')
		.filter(Boolean);

	if (owner && repo) return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
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

export function error(message: string) {
	console.error(`%c[npm-on-github] ${message}`, 'color: red');
}

export function warn(message: string) {
	console.log(`%c[npm-on-github] ${message}`, 'color: orange');
}

export function success(message: string) {
	console.log(`%c[npm-on-github] ${message}`, 'color: green');
}

export function log(message: string) {
	console.log(`[npm-on-github] ${message}`);
}
