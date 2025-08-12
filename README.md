# Trunk Playwright Reporter

To use the Trunk Playwright custom reporter

Add the package: 

```bash
bun add @trunkio/trunk-reporter
```

Confifure Playwright to use reporter:

**Config**

Add reportet to `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/tests';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e',
	reporter: ['trunk-reporter'] // 👈 specify the reporter here; no need to import
});
```

**CLI**
```bash
playwright tests --reporter="trunk-reporter"
```
