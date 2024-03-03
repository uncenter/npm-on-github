import type { Packument } from '@npm/types';
import type { Stats } from '~/modules/downloads/types';
import type { Options } from '~/types';

import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../mocks/node';

import { isFresh, setCache } from '~/modules/downloads/cache';
import { getPackage, isMatchingOwnerRepo } from '~/modules/downloads/package';

describe('isMatchingOwnerRepo', () => {
	test('should return true for correct match with repository.url', () => {
		expect(
			isMatchingOwnerRepo('uncenter', 'npm-on-github', {
				repository: {
					url: 'https://github.com/uncenter/npm-on-github',
				},
			} as Packument),
		).toBe(true);
	});

	test('should return true for correct match with shorthand', () => {
		expect(
			isMatchingOwnerRepo('uncenter', 'npm-on-github', {
				repository: 'uncenter/npm-on-github',
			} as Packument),
		).toBe(true);
	});
});

describe('newPackage', () => {
	const consoleMock = vi
		.spyOn(console, 'log')
		.mockImplementation((...args: unknown[]) => args);

	beforeAll(() => {
		server.listen();
	});

	afterEach(() => {
		server.resetHandlers();
	});

	afterAll(() => {
		server.close();
		consoleMock.mockReset();
	});

	test('should not create new package with valid cache', async () => {
		const cache = {
			owner: 'uncenter',
			repo: 'uncenter',
			name: 'uncenter',
			lastChecked: Date.now(),
			stats: {} as unknown as Stats,
		};
		setCache('uncenter', 'uncenter', cache);

		expect(
			await getPackage('uncenter', 'uncenter', {
				cacheDuration: 1,
			} as Options),
		).toStrictEqual(cache);
	});

	test('should create a new package with an invalid cache', async () => {
		const pkg = await getPackage('uncenter', 'uncenter', {
			cacheDuration: 1,
		} as Options);

		expect(pkg.stats).toBeTruthy();
	});

	test('should return false for mismatch', async () => {
		const pkg = await getPackage('uncenter', 'this-repo-does-not-exist', {
			cacheDuration: 1,
		} as Options);

		expect(consoleMock).toHaveBeenCalledWith(
			expect.stringContaining('package.json repository URL mismatch'),
		);

		expect(pkg.stats).toBe(undefined);
	});
});

describe('cache', () => {
	describe('isFresh', () => {
		test('should return true if cache is fresh', () => {
			expect(
				isFresh(
					{
						owner: 'uncenter',
						repo: 'npm-on-github',
						lastChecked: Date.now(),
					},
					{
						downloadsRange: 'lastDay',
						cacheDuration: 1,
						useNpmLogo: false,
						displayLocation: 'before',
						displayRelativeTo: 'star',
						accessToken: '',
					},
				),
			).toBe(true);
		});
		test('should return false if cache is not fresh', () => {
			expect(
				isFresh(
					{
						owner: 'uncenter',
						repo: 'npm-on-github',
						lastChecked: Date.now() - 2 * 24 * 60 * 60 * 1000,
					},
					{
						downloadsRange: 'lastDay',
						cacheDuration: 1,
						useNpmLogo: false,
						displayLocation: 'before',
						displayRelativeTo: 'star',
						accessToken: '',
					},
				),
			).toBe(false);
		});
	});
});
