# Playwright Testing Target

This project is the **test driver** for the `trunk-reporter` Playwright plugin. It's designed to demonstrate and test the reporter's functionality by running Playwright tests that intentionally include both passing and failing scenarios.

## Project Structure

- **`/src/`** - SvelteKit application which can be ignored
- **`/e2e/`** - Playwright end-to-end tests
- **`playwright.config.ts`** - Configured to use the `trunk-reporter` plugin

## Purpose

This project imports the outer `trunk-reporter` package and runs Playwright tests to:
1. **Test the reporter plugin** - Verify it correctly handles test results
2. **Generate output files** - Demonstrate the reporter's file generation capabilities
3. **Validate functionality** - Ensure the reporter works with real test scenarios

## Setup

Install dependencies:

```sh
bun install
bunx playwright install
```

## Running Tests

Execute the end-to-end tests:

```sh
bun run test:e2e
```

This will:
- Build the SvelteKit app
- Start a preview server
- Run Playwright tests using the `trunk-reporter` plugin
- Generate output files from the reporter

## Test Scenarios

The test suite includes:
- ✅ **Passing tests** - Verify basic functionality works
- ❌ **Failing tests** - Demonstrate error handling and reporting
- **Mixed results** - Show how the reporter handles various test outcomes

## Expected Output

When tests complete, the `trunk-reporter` plugin should generate output files (typically in the project root) that contain the test results and any additional reporting data.

## Development

- Add new tests to `/e2e/` directory to test additional reporter functionality
- Modify the SvelteKit app in `/src/` as needed to create different test scenarios
- Update `playwright.config.ts` to switch reporters as needed

## Publishing

Use the [Publish package to npmjs Action](https://github.com/trunk-io/trunk-playwright-reporter/actions/workflows/publish.yml) to publish a new package to npm.
