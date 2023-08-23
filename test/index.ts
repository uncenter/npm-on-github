import { describe, expect, test } from 'vitest';

import { isFresh } from '../src/cache';
import { formatNumber, getOwnerAndRepo } from '../src/utils';

describe('getOwnerAndRepo', () => {
	test('should return owner and repo', () => {
		expect(getOwnerAndRepo('https://github.com/uncenter/npm-on-github')).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo for git+https', () => {
		expect(getOwnerAndRepo('git+https://github.com/uncenter/npm-on-github.git')).toEqual({
			owner: 'uncenter',
			repo: 'npm-on-github',
		});
	});
	test('should return owner and repo for git+ssh', () => {
		expect(getOwnerAndRepo('git+ssh://github.com/uncenter/npm-on-github.git')).toEqual({
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
	test('should return owner and repo if .git is in the middle', () => {
		expect(getOwnerAndRepo('git+https://github.com/example/.gitingore')).toEqual({
			owner: 'example',
			repo: '.gitingore',
		});
	});
	test('should return null if no owner or repo', () => {
		expect(getOwnerAndRepo('git+https://github.com')).toEqual(null);
	});
});

describe('formatNumber', () => {
	test('should format numbers', () => {
		expect(formatNumber(1000000000)).toEqual('1b');
		expect(formatNumber(1000000)).toEqual('1m');
		expect(formatNumber(1000)).toEqual('1k');
		expect(formatNumber(100)).toEqual('100');
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
						displayPeriod: 'lastDay',
						cacheDuration: 1,
						useNpmLogo: false,
					},
				),
			).toEqual(true);
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
						displayPeriod: 'lastDay',
						cacheDuration: 1,
						useNpmLogo: false,
					},
				),
			).toEqual(false);
		});
	});
});
