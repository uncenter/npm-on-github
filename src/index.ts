import type { Package } from './modules/downloads/types';
import type { Options } from './types';

import { injectContent } from './modules/downloads/inject';
import { getPackage } from './modules/downloads/package';
import { getOwnerAndRepo } from './modules/downloads/utils';

const processPage = async (opts: Options) => {
	const { owner, repo } = getOwnerAndRepo(location.href) || {};
	if (!owner || !repo) return;
	const pkg = await getPackage(owner, repo, opts);
	if (!pkg) return;
	injectContent(pkg as Package, opts);
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
	downloadsRange: 'lastDay',
	cacheDuration: 7,
	useNpmLogo: false,
	displayLocation: 'before',
	displayRelativeTo: 'fork',
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
