<!-- markdownlint-disable first-line-heading -->

[![Trunk.io](https://github.com/user-attachments/assets/c98a90ee-439b-4a9c-bb9a-69dc0e7e2c7e)](https://trunk.io)
[![docs](https://img.shields.io/badge/-docs-darkgreen?logo=readthedocs&logoColor=ffffff)][docs]
[![vscode](https://img.shields.io/visual-studio-marketplace/i/trunk.io?color=0078d7&label=vscode&logo=visualstudiocode)][vscode]
[![slack](https://img.shields.io/badge/-slack-611f69?logo=slack)][slack]
[![openssf](https://api.securityscorecards.dev/projects/github.com/trunk-io/trunk-action/badge)](https://api.securityscorecards.dev/projects/github.com/trunk-io/trunk-action)

# Trunk.io Playwright Reporter

This package exports a [Playwright custom reporter](https://playwright.dev/docs/test-reporters#custom-reporters) for integration with [Trunk Flaky Tests](https://trunk.io/flaky-tests).

## Installation

Install the package using your preferred package manager:

```bash
npm install @trunkio/trunk-playwright-reporter
```

## Configuration

Set the reporter using either option below. 

### Option 1: Configuration File

Update your `playwright.config.ts` to include the reporter:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'], // Keep your preferred console reporter
    ['@trunkio/trunk-playwright-reporter'] // 👈 Add the Trunk reporter
  ],
  // ... other config options
});
```

### Option 2: Command Line

Use the reporter directly from the command line:

```bash
npx playwright test --reporter="@trunkio/trunk-playwright-reporter"
```

### File Output

By default, the reporter outputs a file named `junit.xml` at the root of your project, but you can specify a different filename via an environment variable:

```bash
PLAYWRIGHT_JUNIT_OUTPUT_FILE=/your/custom/path/your_file_name.xml
```

## Examples

See the [test/target/](test/target/) directory for a complete example project that demonstrates how to use the Trunk Reporter in an existing Playwright testsuite.

## Why Trunk Reporter?

While Playwright includes a built-in JUnit reporter, the Trunk Reporter offers:
- **Better Trunk.io Integration** - Trunk-optimized JUnit output
- **Simplified Configuration** - Easier setup and maintenance
- **Focused Functionality** - Purpose-built for [Trunk Flaky Tests](https://trunk.io/flaky-tests)
- **Accurate `testsuite`/`classname`** - Uses suite/title semantics instead of file-name fallbacks for cleaner grouping
- **Full file path** - Emits source location so downstream tools can deep-link to code.

> [!NOTE]  
> **Who is this for?**  
> Anyone producing JUnit XML from Playwright. 
> It’s optimized for Trunk Flaky Tests, but the output benefits any JUnit consumer (CI parsers, dashboards, or artifact analysis).

---

**Made with ❤️ by the Trunk.io team**

[slack]: https://slack.trunk.io
[docs]: https://docs.trunk.io
[vscode]: https://marketplace.visualstudio.com/items?itemName=Trunk.io

