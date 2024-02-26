import type { Options } from './types';
import type { WxtStorageItem } from 'wxt/storage';

import { storage } from 'wxt/storage';

export const options: {
	[O in keyof Options]: WxtStorageItem<Options[O], never>;
} = {
	downloadsRange: storage.defineItem('sync:downloadsRange', {
		defaultValue: 'lastDay',
	}),
	cacheDuration: storage.defineItem('sync:cacheDuration', {
		defaultValue: 7,
	}),
	useNpmLogo: storage.defineItem('sync:useNpmLogo', {
		defaultValue: false,
	}),
	displayLocation: storage.defineItem('sync:displayLocation', {
		defaultValue: 'before',
	}),
	displayRelativeTo: storage.defineItem('sync:displayRelativeTo', {
		defaultValue: 'fork',
	}),
	accessToken: storage.defineItem('sync:accessToken', {
		defaultValue: '',
	}),
};
