import type { Options, Package } from './types';
import { injectContent } from './inject';
import { retrievePackage } from './package';
import { getOwnerAndRepo } from './utils';

const processPage = async (opts: Options) => {
	const { owner, repo } = getOwnerAndRepo(location.href) || {};
	if (!owner || !repo) return;
	let pkg = await retrievePackage(owner, repo, opts);
	if (!pkg) return;
	injectContent(pkg as Package, opts);
};

const handleNavigation = (opts: Options) => {
	const pageContainer = document.getElementById('js-repo-pjax-container');
	if (!pageContainer) return;

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes as any) {
				if (addedNode.classList.contains('pagehead')) {
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
};

chrome.storage.sync.get(Object.keys(defaultOptions), (opts: Partial<Options>) => {
	for (let i = 0; i < Object.keys(defaultOptions).length; i++) {
		const key = Object.keys(defaultOptions)[i] as keyof Options;
		if (opts[key] === undefined) {
			opts[key] = defaultOptions[key] as any;
		}
		chrome.storage.sync.set({ [key]: opts[key] });
	}
	processPage(opts as Options);
	handleNavigation(opts as Options);
});
