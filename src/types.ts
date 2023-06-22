export type Package = {
	owner: string;
	repo: string;
	name?: string;
	lastChecked: number;
	stats?: Stats;
};

export type NpmResponse = {
	start: string;
	end: string;
	package: string;
	downloads: Array<{
		downloads: number;
		day: string;
	}>;
};

export type Stats = {
	full: NpmResponse;
	lastDay: number;
	lastWeek: number;
	lastMonth: number;
};

export type Options = {
	displayPeriod: 'lastDay' | 'lastWeek' | 'lastMonth';
	cacheDuration: number;
	useNpmLogo: boolean;
};
