import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		include: ['test/**/*.test.ts'],
	},
	plugins: [tsconfigPaths()],
});
