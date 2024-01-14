import { build } from 'esbuild';

import { copyPlugin } from './plugins/copy.mjs';
import { manifestPlugin } from './plugins/manifest.mjs';

await build({
	entryPoints: [{ out: 'content_script', in: 'src/index.ts' }],
	bundle: true,
	minify: true,
	outdir: 'dist',
	plugins: [
		copyPlugin({
			src: './public/',
			dest: './dist/',
		}),
		manifestPlugin({
			src: './manifest.ts',
			dest: './dist/',
		}),
	],
});
