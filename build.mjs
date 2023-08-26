import { build } from 'esbuild';
import { copyPlugin } from './copy.mjs';

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
	],
});
