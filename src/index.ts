import type { Options, Package } from './types';
import { injectContent } from './inject';
import { retrievePackage } from './package';
import { getOwnerAndRepo } from './utils';

const processPage = async (opts: Options) => {
	const { owner, repo } = getOwnerAndRepo(location.href) || {};
	if (!owner || !repo) return;
	let pkg = await retrievePackage(owner, repo, opts);
	if (!pkg || !pkg.stats) return;
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
};

chrome.storage.sync.get(
	['display-period', 'cache-duration'],
	({ 'display-period': displayPeriod, 'cache-duration': cacheDuration }) => {
		const opts = { displayPeriod, cacheDuration };
		if (!opts.displayPeriod) {
			chrome.storage.sync.set({
				'display-period': defaultOptions.displayPeriod,
			});
			opts.displayPeriod = defaultOptions.displayPeriod;
		}
		if (!opts.cacheDuration) {
			chrome.storage.sync.set({
				'cache-duration': defaultOptions.cacheDuration,
			});
			opts.cacheDuration = defaultOptions.cacheDuration;
		}
		processPage(opts);
		handleNavigation(opts);
	},
);
