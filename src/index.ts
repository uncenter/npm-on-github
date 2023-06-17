import type { Package } from './types';
import { injectContent } from './inject';
import { retrievePackage } from './package';
import { getOwnerAndRepo } from './utils';

const processPage = async () => {
	const { owner, repo } = getOwnerAndRepo(location.href) || {};
	if (!owner || !repo) return;
	let pkg = await retrievePackage(owner, repo);
	if (!pkg || !pkg.stats) return;
	injectContent(pkg as Package);
};

const handleNavigation = () => {
	const pageContainer = document.getElementById('js-repo-pjax-container');

	if (!pageContainer) {
		return;
	}

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes as any) {
				if (addedNode.classList.contains('pagehead')) {
					processPage();
					break;
				}
			}
		}
	});

	observer.observe(pageContainer, { childList: true });
};

processPage();
handleNavigation();
