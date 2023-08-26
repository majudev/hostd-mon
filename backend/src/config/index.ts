const config = {
	LOGGER: {
		LEVEL: 'debug',
		LOG_HTTP_REQUESTS: true,
	},
	API_WHITELIST: ['localhost:3000'] as Array<string>
} as const;

export default config;
