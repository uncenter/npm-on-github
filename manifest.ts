import pkg from './package.json' assert { type: 'json' };

const title = 'NPM on GitHub';

const manifest: chrome.runtime.ManifestV3 = {
	manifest_version: 3,
	name: title,
	version: pkg.version,
	description: pkg.description,
	icons: {
		16: 'icons/icon16.png',
		48: 'icons/icon48.png',
		128: 'icons/icon128.png',
	},
	permissions: ['storage'],
	content_scripts: [
		{
			matches: ['*://github.com/*'],
			js: ['content_script.js'],
			css: ['styles.css'],
		},
	],
	action: {
		default_title: title,
		default_popup: 'popup.html',
	},
};

export default manifest;
