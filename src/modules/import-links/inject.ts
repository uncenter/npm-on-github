import builtins from 'builtin-modules';
import { detectImports } from 'detect-imports';

export function injectContent() {
	const injectionPoint = document.querySelector('.react-code-file-contents');
	if (!injectionPoint) return;

	injectionPoint.parentElement?.parentElement?.setAttribute(
		'style',
		'pointer-events: all;',
	);

	const lines = injectionPoint.querySelectorAll(
		'.react-code-lines .react-code-line-contents',
	);

	for (const line of lines) {
		const spans = [...line.querySelectorAll('span')];

		for (const span of spans) {
			span.textContent = span.getAttribute('data-code-text');
			span.setAttribute('data-code-text', '');
		}

		const imports = detectImports(spans.map((span) => span.textContent).join(''));
		if (imports.length === 0) continue;

		const l = line.querySelector('.react-file-line');
		l?.setAttribute('style', l.getAttribute('style') + 'display: inline-flex;');

		const imp = imports.at(0);
		if (!imp || imp.specifier.startsWith('.')) continue;

		for (const span of spans) {
			if ((span.textContent as string).includes(imp.specifier)) {
				span.innerHTML = /* html */ `<span>'</span><a href="${
					imp.specifier.startsWith('node:') || builtins.includes(imp.specifier)
						? 'https://nodejs.org/docs/latest-v21.x/api/' +
							imp.specifier
								.replace(/^node:/, '')
								.split('/')
								.at(0) +
							'.html'
						: 'https://npmjs.com/' + imp.specifier
				}" style="color: inherit;text-decoration: underline;">${
					imp.specifier
				}</a><span>'</span>`;
				span.setAttribute('data-code-text', '');
			}
		}
	}
}
