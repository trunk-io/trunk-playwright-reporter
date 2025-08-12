<!-- markdownlint-disable first-line-heading -->

[![Trunk.io](https://github.com/user-attachments/assets/c98a90ee-439b-4a9c-bb9a-69dc0e7e2c7e)](https://trunk.io)

# Trunk.io Playwright Reporter

This custom Playwright reporter generates the Junit XML test report used to upload to Trunk.io.

## Get Started

Install the package: 

```bash
npm install @trunkio/trunk-reporter
```

Update `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e',
	reporter: ['trunk-reporter'] // 👈 specify the reporter here; no need to import
});
```

**Or using the CLI**
```bash
playwright test --reporter="trunk-reporter"
```

## Feedback

Join the [Trunk Community Slack][slack]. ❤️

[slack]: https://slack.trunk.io
[docs]: https://docs.trunk.io
[vscode]: https://marketplace.visualstudio.com/items?itemName=Trunk.io

