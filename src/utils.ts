export function getOwnerAndRepo(url: string) {
	const prefixes = ['git+https://', 'git+ssh://', 'git://'];

	for (const prefix of prefixes) {
		if (url.startsWith(prefix)) {
			url = url.slice(prefix.length).replace(/\.git$/, '');
			if (!url.startsWith('https://')) url = `https://` + url;
		}
	}
	const [owner, repo] = new URL(url).pathname.split('/').filter(Boolean);

	if (owner && repo) {
		return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
	}

	return null;
}

export function formatNumber(num: number | string) {
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
