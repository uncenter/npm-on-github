import type { Options, Package, Stats } from './types';
import { Chart } from 'chart.js/auto';
import { newPackage } from './package';
import { formatNumber, success, warn } from './utils';

export function renderChart(canvasId: string, stats: Stats): Chart {
	const chart = new Chart(document.getElementById(canvasId) as HTMLCanvasElement, {
		type: 'line',
		data: {
			labels: stats.full.downloads.map((d) => d.day),
			datasets: [
				{
					label: 'Downloads',
					data: stats.full.downloads.map((d) => d.downloads),
					borderWidth: 1,
					borderColor: '#28a745',
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					backgroundColor: '#28a745',
					titleColor: '#fff',
					bodyColor: '#fff',
					callbacks: {
						title: (context: any) => (context[0].label ? context[0].label : context[0].parsed.x),
						label: (context: any) => context.parsed.y.toLocaleString(),
					},
				},
			},
			scales: {
				y: {
					ticks: {
						callback(value: any, index: any, values: any) {
							return value.toLocaleString();
						},
					},
				},
			},
		},
	});
	return chart;
}

export function injectContent(pkg: Package, opts: Options, refresh = false) {
	if (!pkg.stats) return;
	const injectionPoint = document.querySelector('ul.pagehead-actions');
	if (!injectionPoint || (injectionPoint.querySelector('.npm-stats') && !refresh)) return;

	let chart: Chart;
	const observer = new MutationObserver((mutations) => {
		if (!document.getElementById('npm-stats-chart')) return;
		observer.disconnect();
		chart = renderChart('npm-stats-chart', pkg.stats as Stats);
	});

	observer.observe(injectionPoint, { childList: true });

	let li;
	if (!document.querySelector('.npm-stats')) {
		li = document.createElement('li');
		li.className = 'npm-stats';
	} else {
		li = document.querySelector('.npm-stats') as HTMLLIElement;
	}

	// prettier-ignore
	li.innerHTML = `
    <div data-view-component="true" class="d-flex">
        <a href="https://www.npmjs.com/package/${pkg.name}" target="_blank" class="btn btn-sm btn-with-count tooltipped tooltipped-s BtnGroup-item" aria-label="View package on npmjs.com" ata-view-component="true">
            ${opts.useNpmLogo ? `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="13px" viewBox="0 0 18 7">
                <path fill="#CB3837" d="M0,0h18v6H9v1H5V6H0V0z M1,5h2V2h1v3h1V1H1V5z M6,1v5h2V5h2V1H6z M8,2h1v2H8V2z M11,1v4h2V2h1v3h1V2h1v3h1V1H11z"/>
                <polygon fill="#FFFFFF" points="1,5 3,5 3,2 4,2 4,5 5,5 5,1 1,1 "/>
                <path fill="#FFFFFF" d="M6,1v5h2V5h2V1H6z M9,4H8V2h1V4z"/>
                <polygon fill="#FFFFFF" points="11,1 11,5 13,5 13,2 14,2 14,5 15,5 15,2 16,2 16,5 17,5 17,1 "/>
            </svg>
            ` : `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="octicon octicon-move-to-bottom">
                <path d="M7.47 10.78a.749.749 0 0 0 1.06 0l3.75-3.75a.749.749 0 1 0-1.06-1.06L8.75 8.439V1.75a.75.75 0 0 0-1.5 0v6.689L4.78 5.97a.749.749 0 1 0-1.06 1.06l3.75 3.75ZM3.75 13a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"></path>
            </svg>
            <span data-view-component="true" class="d-inline"> Downloads </span>
            `}
            <span
                aria-label="${pkg.stats[opts.displayPeriod].toLocaleString()} npm downloads in the ${opts.displayPeriod.replace(
                    'last', 'last ',
                ).toLowerCase()}"
                data-turbo-replace="true"
                title="${pkg.stats[opts.displayPeriod].toLocaleString()}"
                data-view-component="true"
                class="Counter js-social-count"
            >
                ${formatNumber(pkg.stats[opts.displayPeriod])}
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
                    <button id="npm-stats-refresh" type="button" data-view-component="true" class="user-lists-menu-action js-user-lists-create-trigger btn-invisible btn btn-block text-normal rounded-1 px-2"${new Date().getTime() - pkg.lastChecked < 86400000 ? ' disabled' : ''}>
                        <svg viewBox="0 0 16 16" width="16" height="16" data-view-component="true" class="octicon octicon-sync"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg> Refresh stats 
                    </button>
                </footer>
            </details-menu>
        </details>
    </div>`;
	injectionPoint.appendChild(li);
	injectionPoint.querySelector('#npm-stats-refresh')?.addEventListener('click', async () => {
		const newPkg = await newPackage(pkg.owner, pkg.repo);
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
