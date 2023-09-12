// https://github.com/sprout2000/esbuild-copy-plugin

// The MIT License (MIT)

// Copyright (c) 2021-2022 Nick Janetakis <nick.janetakis@gmail.com>, sprout2000 and other contributors

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import fs from 'node:fs';
import crypto from 'node:crypto';

const getDigest = (string) => {
	const hash = crypto.createHash('md5');
	const data = hash.update(string, 'utf-8');

	return data.digest('hex');
};

const getFileDigest = (path) => {
	if (fs.existsSync(path) && !fs.statSync(path).isDirectory()) {
		return getDigest(fs.readFileSync(path).toString());
	}
	return null;
};

const filter = (src, dest) => {
	if (fs.existsSync(dest) && !fs.statSync(dest).isDirectory()) {
		return getFileDigest(src) !== getFileDigest(dest);
	}
	return true;
};

export const copyPlugin = (options = {}) => ({
	name: 'esbuild-copy-plugin',
	setup(build) {
		const src = options.src;
		const dest = options.dest;
		if (!src || !dest)
			throw new Error('Source and/or destination option(s) are undefined.');

		build.onEnd(() =>
			fs.cpSync(src, dest, {
				dereference: options.dereference || false,
				errorOnExist: options.errorOnExist || false,
				filter: options.filter || filter,
				force: options.force || true,
				preserveTimestamps: options.preserveTimestamps || false,
				recursive: options.recursive || true,
				verbatimSymlinks: options.verbatimSymlinks || false,
			}),
		);
	},
});
