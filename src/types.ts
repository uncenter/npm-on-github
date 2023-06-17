export type Package = Cache & {
    data: {
        name: string;
        stats: Stats;
        valid: true;
    };
};

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

export type Cache = {
    owner: string;
    repo: string;
    created: number;
    expires?: number;
    data: {
        name: string | undefined;
        stats?: Stats;
        valid: boolean;
    };
};
