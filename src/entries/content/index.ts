import type { Package } from '@/modules/downloads/types';
import type { Options } from '@/types';

import { defineContentScript } from 'wxt/sandbox';
import './styles.css';

import { injectContent } from '@/modules/downloads/inject';
import { getPackage } from '@/modules/downloads/package';
import { getOwnerAndRepo } from '@/modules/downloads/utils';
import { options } from '@/options';

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

export default defineContentScript({
	matches: ['*://github.com/*'],
	async main() {
		const merged = Object.fromEntries(
			await Promise.all(
				Object.entries(options).map(async ([key, value]) => [
					key,
					await value.getValue(),
				]),
			),
		);
		processPage(merged);
		handleNavigation(merged);
	},
});
