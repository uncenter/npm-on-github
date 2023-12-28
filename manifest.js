// @ts-check
import pkg from './package.json' assert { type: 'json' };

/**
 * @typedef {chrome.runtime.ManifestV3} ChromeManifest
 */

/**
 * @type {ChromeManifest}
 */
const manifest = {
	manifest_version: 3,
	name: 'NPM on GitHub',
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
		default_title: 'NPM on GitHub',
		default_popup: 'popup.html',
	},
};

export default manifest;