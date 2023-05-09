import { Chart } from "chart.js/auto";
import { createPackage } from "./package";
import { ValidCache } from "./cache";

export type Stats = {
    full: NpmDownload;
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
};

export type NpmDownload = {
    start: string;
    end: string;
    package: string;
    downloads: Array<{
        downloads: number;
        day: string;
    }>;
};

export async function fetchStats(packageName: string) {
    const response = await fetch(
        `https://api.npmjs.org/downloads/range/last-month/${packageName}`
    );

    if (response.status === 404) {
        return null;
    }

    const responseBody = (await response.json()) as NpmDownload;
    const { downloads } = responseBody;
    const lastDay = downloads[downloads.length - 1].downloads;
    const lastWeek = downloads
        .slice(downloads.length - 7, downloads.length)
        .reduce((sum: number, day: any) => sum + day.downloads, 0);
    const lastMonth = downloads.reduce(
        (sum: any, day: any) => sum + day.downloads,
        0
    );

    return {
        full: responseBody,
        lastDay,
        lastWeek,
        lastMonth,
    };
}

export function renderChart(canvasId: string, stats: Stats) {
    const chart = new Chart(
        document.getElementById(canvasId) as HTMLCanvasElement,
        {
            type: "line",
            data: {
                labels: stats.full.downloads.map((d) => d.day),
                datasets: [
                    {
                        label: "Downloads",
                        data: stats.full.downloads.map((d) => d.downloads),
                        borderWidth: 1,
                        borderColor: "#28a745",
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        display: false,
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
        }
    );
}

export function renderStats(pkg: ValidCache, refresh = false) {
    const pageheadActions = document.querySelector("ul.pagehead-actions");
    if (
        !pageheadActions ||
        (pageheadActions.querySelector(".npm-stats") && !refresh)
    ) {
        return;
    }

    const observer = new MutationObserver((mutations) => {
        const chartCanvas = document.getElementById(
            "npm-stats-chart"
        ) as HTMLCanvasElement;
        if (!chartCanvas) return;
        observer.disconnect();
        renderChart("npm-stats-chart", pkg.stats);
    });

    observer.observe(pageheadActions, { childList: true });

    const shortenNumber = (num: number) => {
        if (num >= 1000000000) {
            return `${Math.round(num / 100000000) / 10}b`;
        }
        if (num >= 1000000) {
            return `${Math.round(num / 100000) / 10}m`;
        }
        if (num >= 1000) {
            return `${Math.round(num / 100) / 10}k`;
        }
        return num;
    };

    let li;
    if (!document.querySelector(".npm-stats")) {
        li = document.createElement("li");
        li.className = "npm-stats";
    } else {
        li = document.querySelector(".npm-stats") as HTMLLIElement;
    }
    li.innerHTML = `
    <div data-view-component="true" class="starred BtnGroup flex-1">
    <a href="https://www.npmjs.com/package/${
        pkg.name
    }" target="_blank" class="btn btn-sm btn-with-count tooltipped tooltipped-s BtnGroup-item" aria-label="View package on npmjs.com" ata-view-component="true">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="13px" viewBox="0 0 18 7">
        <path fill="#CB3837" d="M0,0h18v6H9v1H5V6H0V0z M1,5h2V2h1v3h1V1H1V5z M6,1v5h2V5h2V1H6z M8,2h1v2H8V2z M11,1v4h2V2h1v3h1V2h1v3h1V1H11z"/>
        <polygon fill="#FFFFFF" points="1,5 3,5 3,2 4,2 4,5 5,5 5,1 1,1 "/>
        <path fill="#FFFFFF" d="M6,1v5h2V5h2V1H6z M9,4H8V2h1V4z"/>
        <polygon fill="#FFFFFF" points="11,1 11,5 13,5 13,2 14,2 14,5 15,5 15,2 16,2 16,5 17,5 17,1 "/>
      </svg>
      <span
        aria-label="${pkg.stats.lastDay.toLocaleString()} NPM downloads in the last day"
                data-singular-suffix="downloads in the last day"
                data-plural-suffix="download in the last day"
                data-turbo-replace="true"
                title="${pkg.stats.lastDay.toLocaleString()}"
                data-view-component="true"
                class="Counter js-social-count"
            >
                ${shortenNumber(pkg.stats.lastDay)}
            </span>
    </a>
    <details class="details-reset details-overlay BtnGroup-parent js-user-list-menu d-inline-block position-relative"${
        refresh ? " open" : ""
    }>
      <summary class="btn-sm btn BtnGroup-item px-2 float-none" aria-haspopup="menu" role="button" aria-label="View NPM downloads graph for ${
          pkg.name
      }">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-triangle-down">
    <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
</svg>
      </summary>
      <details-menu class="select-menu-modal position-absolute">
        <div class="select-menu-header">
          <h5>Downloads</h5>
          <button id="npm-stats-refresh" type="button" class="btn tooltipped tooltipped-w" aria-label="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>
            </button>
        </div>
        <dl>
          <dt>Last day</dt>
          <dd>${pkg.stats.lastDay.toLocaleString()}</dd>
          <dt>Last week</dt>
          <dd>${pkg.stats.lastWeek.toLocaleString()}</dd>
          <dt>Last month</dt>
          <dd>${pkg.stats.lastMonth.toLocaleString()}</dd>
        </dl>
        <canvas id="npm-stats-chart"></canvas>
      </details-menu>
    </details>
    </div>
  `;
    pageheadActions.appendChild(li);
    document
        ?.querySelector("#npm-stats-refresh")
        ?.addEventListener("click", async () => {
            renderStats(
                (await createPackage(pkg.owner, pkg.repo)) as ValidCache,
                true
            );
        });
}
