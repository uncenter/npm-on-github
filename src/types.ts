export type Options = {
	downloadsRange: 'lastDay' | 'lastWeek' | 'lastMonth';
	cacheDuration: number;
	useNpmLogo: boolean;
	displayLocation: 'before' | 'after';
	displayRelativeTo: 'sponsor' | 'pin' | 'watch' | 'fork' | 'star';
	accessToken: string;
};
