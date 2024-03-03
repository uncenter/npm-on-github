import { describe, expect, test } from 'vitest';

import {
	formatNumber,
	getOwnerAndRepo,
	parseNpmPackageShorthand,
} from '~/modules/downloads/utils';

describe('getOwnerAndRepo', () => {
	test('should return owner and repo', () => {
		expect(getOwnerAndRepo('https://github.com/uncenter/npm-on-github')).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo with query parameter', () => {
		expect(
			getOwnerAndRepo(
				'https://github.com/uncenter/npm-on-github?q=some-query-argument',
			),
		).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo with hash', () => {
		expect(
			getOwnerAndRepo('https://github.com/uncenter/npm-on-github#some-hash'),
		).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo with query parameter and hash', () => {
		expect(
			getOwnerAndRepo(
				'git://github.com/uncenter/npm-on-github?q=some-query-argument#some-hash',
			),
		).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo for git+https', () => {
		expect(
			getOwnerAndRepo('git+https://github.com/uncenter/npm-on-github.git'),
		).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo for git+ssh', () => {
		expect(
			getOwnerAndRepo('git+ssh://github.com/uncenter/npm-on-github.git'),
		).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo for git', () => {
		expect(getOwnerAndRepo('git://github.com/uncenter/npm-on-github.git')).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo with no .git', () => {
		expect(getOwnerAndRepo('git+https://github.com/uncenter/npm-on-github')).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo if repo name contains .git', () => {
		expect(getOwnerAndRepo('https://github.com/example/.github')).toEqual({
			owner: 'example',
			repo: '.github',
		});
	});
	test('should return undefined if no owner or repo', () => {
		expect(getOwnerAndRepo('https://github.com')).toBeUndefined();
	});
});

describe('parseNpmPackageShorthand', () => {
	test('should return correct object result', () => {
		expect(parseNpmPackageShorthand('github:uncenter/npm-on-github')).toStrictEqual({
			provider: 'github',
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});

	test('should return correct default provider', () => {
		expect(parseNpmPackageShorthand('uncenter/npm-on-github')).toStrictEqual({
			provider: 'github',
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
});

describe('formatNumber', () => {
	test('should format numbers', () => {
		expect(formatNumber(1_000_000_000)).toBe('1b');
		expect(formatNumber(1_000_000)).toBe('1m');
		expect(formatNumber(1000)).toBe('1k');
		expect(formatNumber(100)).toBe('100');
	});
});
