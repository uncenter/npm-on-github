import { Chart } from "chart.js/auto";

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

export function renderStats(packageName: string, stats: Stats) {
    const pageheadActions = document.querySelector("ul.pagehead-actions");
    if (!pageheadActions || pageheadActions.querySelector(".npm-stats")) {
        return;
    }

    const observer = new MutationObserver((mutations) => {
        const chartCanvas = document.getElementById(
            "npm-stats-chart"
        ) as HTMLCanvasElement;
        if (!chartCanvas) return;
        observer.disconnect();
        renderChart("npm-stats-chart", stats);
    });

    observer.observe(pageheadActions, { childList: true });

    const li = document.createElement("li");
    li.className = "npm-stats";
    li.innerHTML = `
    <div data-view-component="true">
    <a href="https://www.npmjs.com/package/${packageName}" target="_blank" class="btn btn-sm btn-with-count tooltipped tooltipped-s BtnGroup-item" aria-label="View package on npmjs.com" ata-view-component="true">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="13px" viewBox="0 0 18 7">
        <path fill="#CB3837" d="M0,0h18v6H9v1H5V6H0V0z M1,5h2V2h1v3h1V1H1V5z M6,1v5h2V5h2V1H6z M8,2h1v2H8V2z M11,1v4h2V2h1v3h1V2h1v3h1V1H11z"/>
        <polygon fill="#FFFFFF" points="1,5 3,5 3,2 4,2 4,5 5,5 5,1 1,1 "/>
        <path fill="#FFFFFF" d="M6,1v5h2V5h2V1H6z M9,4H8V2h1V4z"/>
        <polygon fill="#FFFFFF" points="11,1 11,5 13,5 13,2 14,2 14,5 15,5 15,2 16,2 16,5 17,5 17,1 "/>
      </svg>
    </a>
    <details class="details-reset details-overlay BtnGroup-parent js-user-list-menu d-inline-block position-relative">
      <summary class="btn-sm btn BtnGroup-item px-2 float-none" aria-haspopup="menu" role="button" aria-label="Toggle npm stats menu">
        <span class="Counter js-social-count">${stats.lastDay.toLocaleString()}</span>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-triangle-down">
    <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
</svg>
      </summary>
      <details-menu class="select-menu-modal position-absolute">
        <div class="select-menu-header">
          <span class="select-menu-title">Downloads</span>
        </div>
        <dl>
          <dt>Last day</dt>
          <dd>${stats.lastDay.toLocaleString()}</dd>
          <dt>Last week</dt>
          <dd>${stats.lastWeek.toLocaleString()}</dd>
          <dt>Last month</dt>
          <dd>${stats.lastMonth.toLocaleString()}</dd>
        </dl>
        <canvas id="npm-stats-chart"></canvas>
      </details-menu>
    </details>
    <div data-view-component="true" class="BtnGroup d-flex">

  `;
    pageheadActions.appendChild(li);
}
