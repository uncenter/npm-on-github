import type { Package } from './modules/downloads/types';
import type { Options } from './types';

import { injectContent as injectDownloads } from './modules/downloads/inject';
import { getPackage } from './modules/downloads/package';
import { getOwnerAndRepo } from './modules/downloads/utils';
import { injectContent as injectImportLinks } from './modules/import-links/inject';

const processPage = async (opts: Options) => {
	/* Downloads */

	const { owner, repo } = getOwnerAndRepo(location.href) || {};

	if (owner && repo) {
		const pkg = await getPackage(owner, repo, opts);
		if (pkg) injectDownloads(pkg as Package, opts);
	}

	/* Import Links */

	// eslint-disable-next-line unicorn/better-regex
	const IS_FILE_ON_GITHUB_REGEX = /(\.)([c|m]?[j|t]s[x]?)/;
	if (IS_FILE_ON_GITHUB_REGEX.test(location.href)) {
		console.log('Injecting import links!');
		injectImportLinks();
	}
};

const handleNavigation = (opts: Options) => {
	const pageContainer = document.querySelector('#js-repo-pjax-container');
	if (!pageContainer) return;

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes) {
				if ((addedNode as Element).classList.contains('pagehead')) {
					processPage(opts);
					break;
				}
			}
		}
	});

	observer.observe(pageContainer, { childList: true });
};

const defaultOptions: Options = {
	displayPeriod: 'lastDay',
	cacheDuration: 7,
	useNpmLogo: false,
	accessToken: '',
};

chrome.storage.sync.get(Object.keys(defaultOptions), (opts: Partial<Options>) => {
	const merged = { ...defaultOptions, ...opts } as const;
	for (const [key, value] of Object.entries(merged)) {
		chrome.storage.sync.set({ [key]: value });
	}
	processPage(merged);
	handleNavigation(merged);
});
