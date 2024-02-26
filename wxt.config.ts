import { defineConfig } from 'wxt';

export default defineConfig({
	srcDir: 'src',
	entrypointsDir: 'entries',
	outDir: 'dist',
	manifest: {
		name: 'NPM on GitHub',
		homepage_url: 'https://github.com/uncenter/npm-on-github',
		permissions: ['storage'],
		browser_specific_settings: {
			gecko: {
				id: 'npm-on-github@uncenter.dev',
				strict_min_version: '42.0',
			},
		},
	},
});
