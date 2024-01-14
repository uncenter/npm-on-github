import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import jiti from 'jiti';

const importTS = jiti(process.cwd(), {
	interopDefault: true,
	esmResolve: true,
});

export const manifestPlugin = (options = {}) => ({
	name: 'esbuild-chrome-extension-manifest-plugin',
	setup(build) {
		const src = options.src;
		const dest = options.dest;
		if (!src) throw new Error('`options.src` is required.');
		if (!dest) throw new Error('`options.dest` is required.');

		build.onEnd(async () => {
			const manifest = JSON.stringify(
				src.split('.').at(-1) === 'ts'
					? importTS(path.join(process.cwd(), src))
					: await import(path.join(process.cwd(), src)).then(
							(result) => result.default,
						),
				undefined,
				2,
			);
			fs.writeFileSync(path.join(process.cwd(), dest, 'manifest.json'), manifest);
		});
	},
});
