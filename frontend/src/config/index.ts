const config = {
	API_URL: 'https://sia.watch/api',
	CHARTS: {
		DURATION_BUTTONS: ['24h', '7d', '14d', '30d', '90d', '180d', '1y', 'max'],
		REFRESH_DATA_INTERVAL_MS: 30_000
	}
} as const;

export default config;
