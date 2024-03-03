import { http, HttpResponse } from 'msw';

export const handlers = [
	http.get('https://api.github.com/repos/:owner/:repo/contents/package.json', () => {
		return HttpResponse.json({
			content: btoa(
				JSON.stringify({
					name: 'uncenter',
					version: '0.1.0',
					repository: 'uncenter/uncenter',
					// engines: {
					// 	vscode: true,
					// },
					// publisher: 'uncenter',
				}),
			),
		});
	}),
	http.get('https://registry.npmjs.org/:pkg', () => {
		return HttpResponse.json({
			repository: {
				url: 'https://github.com/uncenter/uncenter',
			},
			// repository: "uncenter/uncenter",
		});
	}),
	http.get('https://api.npmjs.org/downloads/range/last-month/:pkg', () => {
		return HttpResponse.json({
			downloads: Array.from({ length: 31 }, (_, index) => ({
				downloads: Math.floor(Math.random() * 101),
				day: `2000-01-${index + 1}`,
			})),
		});
	}),
];
