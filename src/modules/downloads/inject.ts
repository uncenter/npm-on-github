import type { Package, Stats } from './types';
import type { Options } from '../../types';

import { Chart } from 'chart.js/auto';

import { success, warn } from '../../logger';

import { DOWNLOAD_ICON_SVG, NPM_LOGO_SVG } from './icons';
import { newPackage } from './package';
import { formatNumber, getCSSVariable } from './utils';

export function renderChart(canvasId: string, stats: Stats): Chart {
	const accentColor = getCSSVariable('--color-accent-fg');
	const neutralColor = getCSSVariable('--color-neutral-emphasis');
	const mutedColor = getCSSVariable('--color-border-default');

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const chart = new Chart(document.querySelector(`#${canvasId}`) as HTMLCanvasElement, {
		type: 'line',
		data: {
			labels: stats.full.downloads.map((d) => d.day),
			datasets: [
				{
					label: 'Downloads',
					data: stats.full.downloads.map((d) => d.downloads),
					borderWidth: 1,
					borderColor: accentColor,
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					backgroundColor: accentColor,
					titleColor: '#fff',
					bodyColor: '#fff',

					callbacks: {
						title: (context: any) => context[0].label ?? context[0].parsed.x,
						label: (context: any) => context.parsed.y.toLocaleString(),
					},
				},
			},
			scales: {
				y: {
					ticks: {
						callback(value: any) {
							return value.toLocaleString();
						},
						color: neutralColor,
					},
					grid: {
						color: mutedColor,
					},
				},
				x: {
					ticks: {
						color: neutralColor,
					},
					grid: {
						color: mutedColor,
					},
				},
			},
		},
	});
	/* eslint-enable @typescript-eslint/no-explicit-any */
	return chart;
}

export function injectContent(pkg: Package, opts: Options, refresh = false) {
	if (!pkg.stats) return;
	const injectionPoint = document.querySelector('ul.pagehead-actions');
	if (!injectionPoint || (injectionPoint.querySelector('.npm-stats') && !refresh))
		return;

	let chart: Chart;
	const observer = new MutationObserver(() => {
		if (!document.querySelector('#npm-stats-chart')) return;
		observer.disconnect();
		chart = renderChart('npm-stats-chart', pkg.stats as Stats);
	});

	observer.observe(injectionPoint, { childList: true });

	let li;
	if (document.querySelector('.npm-stats')) {
		li = document.querySelector('.npm-stats') as HTMLLIElement;
	} else {
		li = document.createElement('li');
		li.className = 'npm-stats';
	}

	/* prettier-ignore */
	li.innerHTML = /* html */ `
		<div data-view-component="true" class="d-flex">
		    <a href="https://www.npmjs.com/package/${pkg.name}" target="_blank" class="btn btn-sm btn-with-count tooltipped tooltipped-s BtnGroup-item" aria-label="View package on npmjs.com" ata-view-component="true">
		        ${opts.useNpmLogo ? NPM_LOGO_SVG : /* html */ `${DOWNLOAD_ICON_SVG}<span data-view-component="true" class="d-inline"> Downloads </span>`}
		        <span
		            aria-label="${pkg.stats[opts.downloadsRange].toLocaleString()} npm downloads in the ${opts.downloadsRange.replace(
                    'last', 'last ',
                ).toLowerCase()}"
		            data-turbo-replace="true"
		            title="${pkg.stats[opts.downloadsRange].toLocaleString()}"
		            data-view-component="true"
		            class="Counter js-social-count"
		        >
		            ${formatNumber(pkg.stats[opts.downloadsRange])}
		        </span>
		    </a>
		    <details id="npm-stats-details" class="details-reset details-overlay BtnGroup-parent js-user-list-menu d-inline-block position-relative"${refresh ? ' open' : ''}>
		        <summary class="btn-sm btn BtnGroup-item px-2 float-none" aria-haspopup="menu" role="button" aria-label="View NPM downloads graph for ${pkg.name}">
		            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-triangle-down">
		                <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
		            </svg>
		        </summary>
		        <details-menu class="select-menu-modal position-absolute" style="animation-name: SelectMenu-modal-animation--sm;">
		            <header class="SelectMenu-header">
		                <h5 class="SelectMenu-title f5">Downloads</h5>
		                <button id="npm-stats-close" type="button" class="SelectMenu-closeButton" aria-label="Close menu">
		                    <svg viewBox="0 0 16 16" height="16" width="16" data-view-component="true" class="octicon octicon-x" aria-hidden="true"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path></svg>
		                </button>
		            </header>
		            <div class="select-menu-content">
		                <dl>
		                    <dt>Last day</dt>
		                    <dd>${pkg.stats.lastDay.toLocaleString()}</dd>
		                    <dt>Last week</dt>
		                    <dd>${pkg.stats.lastWeek.toLocaleString()}</dd>
		                    <dt>Last month</dt>
		                    <dd>${pkg.stats.lastMonth.toLocaleString()}</dd>
		                </dl>
		                <canvas id="npm-stats-chart"></canvas>
		            </div>
		            <footer class="SelectMenu-footer px-2">
		                <button id="npm-stats-refresh" type="button" data-view-component="true" class="user-lists-menu-action js-user-lists-create-trigger btn-invisible btn btn-block text-normal rounded-1 px-2"${Date.now() - pkg.lastChecked < 86_400_000 ? ' disabled' : ''}>
		                    <svg viewBox="0 0 16 16" width="16" height="16" data-view-component="true" class="octicon octicon-sync"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg> Refresh stats
		                </button>
		            </footer>
		        </details-menu>
		    </details>
		</div>
	`;

	let prev;
	let injected = false;
	for (const [item, icon] of Object.entries({
		sponsor: 'octicon-heart',
		pin: 'octicon-pin',
		watch: 'octicon-eye',
		fork: 'octicon-repo-forked',
		star: 'octicon-star-fill',
	})) {
		const curr = injectionPoint.querySelector(`li:has(.${icon})`);
		if (curr) prev = curr;

		if (curr && opts.displayRelativeTo === item) {
			curr[opts.displayLocation](li);
			injected = true;
			break;
		} else if (!curr && opts.displayRelativeTo === item && prev) {
			prev.after(li);
			injected = true;
			break;
		}
	}

	if (!injected) {
		if (opts.displayLocation === 'before' && injectionPoint.firstChild) {
			injectionPoint.firstChild.before(li);
		} else {
			injectionPoint.append(li);
		}
	}

	injectionPoint
		.querySelector('#npm-stats-refresh')
		?.addEventListener('click', async () => {
			const newPkg = await newPackage(pkg.owner, pkg.repo, opts);
			if (newPkg?.stats) {
				chart.destroy();
				injectContent(newPkg as Package, opts, true);
				success('Refreshed stats successfully!');
			} else {
				warn('Failed to refresh stats.');
			}
		});
	injectionPoint.querySelector('#npm-stats-close')?.addEventListener('click', () => {
		injectionPoint.querySelector('#npm-stats-details')?.removeAttribute('open');
	});
}
