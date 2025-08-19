// noinspection JSUnusedGlobalSymbols

import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e',
	reporter: [['list'], ['@trunkio/trunk-playwright-reporter'], ['junit', { outputFile: 'junit-built-in.xml' }]]
});
