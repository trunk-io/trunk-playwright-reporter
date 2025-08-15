<!-- markdownlint-disable first-line-heading -->

[![Trunk.io](https://github.com/user-attachments/assets/c98a90ee-439b-4a9c-bb9a-69dc0e7e2c7e)](https://trunk.io)
[![docs](https://img.shields.io/badge/-docs-darkgreen?logo=readthedocs&logoColor=ffffff)][docs]
[![vscode](https://img.shields.io/visual-studio-marketplace/i/trunk.io?color=0078d7&label=vscode&logo=visualstudiocode)][vscode]
[![slack](https://img.shields.io/badge/-slack-611f69?logo=slack)][slack]
[![openssf](https://api.securityscorecards.dev/projects/github.com/trunk-io/trunk-action/badge)](https://api.securityscorecards.dev/projects/github.com/trunk-io/trunk-action)

# Trunk.io Playwright Reporter

This package exports a Playwright [custom reporter](https://playwright.dev/docs/test-reporters#custom-reporters) for integration with  [Trunk Flaky Tests](https://trunk.io/flaky-tests).

## Features

- **Simple Integration** - Easy to add to any Playwright project
- **Trunk.io Optimized** - Designed specifically for Trunk.io workflows
- **Lightweight** - Minimal overhead, focused functionality
- **Reliable** - Handles various test scenarios and failure modes

## Installation

Install the package using your preferred package manager:

```bash
npm install @trunkio/trunk-reporter
```

## Configuration

### Option 1: Configuration File

Update your `playwright.config.ts` to include the reporter:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'], // Keep your preferred console reporter
    ['trunk-reporter'] // 👈 Add the Trunk reporter
  ],
  // ... other config options
});
```

### Option 2: Command Line

Use the reporter directly from the command line:

```bash
npx playwright test --reporter="trunk-reporter"
```

## Why Trunk Reporter?

While Playwright includes a built-in JUnit reporter, the Trunk Reporter offers:
- **Better Trunk.io Integration** - Optimized JUnit XML file output for Trunk's reporting requirements
- **Simplified Configuration** - Easier setup and maintenance
- **Focused Functionality** - Purpose-built for Trunk workflows

## Examples

See the [test/target/](test/target/) directory for a complete example project that demonstrates how to use the Trunk Reporter in an existing Playwright testsuite.

## Related Projects

This reporter is part of the Trunk.io ecosystem. Check out other Trunk tools:

- [Trunk Action](https://github.com/trunk-io/trunk-action) - GitHub Action for Trunk
- [Trunk VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Trunk.io) - VS Code integration

---

**Made with ❤️ by the Trunk.io team**

[slack]: https://slack.trunk.io
[docs]: https://docs.trunk.io
[vscode]: https://marketplace.visualstudio.com/items?itemName=Trunk.io

