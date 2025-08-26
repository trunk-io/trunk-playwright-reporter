// noinspection JSUnusedGlobalSymbols
import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult
} from '@playwright/test/reporter';
import builder from 'junit-report-builder';

export class TrunkReporter implements Reporter {
    private testSuites = new Map<string, any>(); // Map file path to test suite
    private hasFailures = false;
    private outputFile = 'junit.xml'

    onBegin(config: FullConfig, suite: Suite) {
        let testOpts: any = undefined;
        if (config.reporter && Array.isArray(config.reporter)) {
            for (const reporterConfig of config.reporter) {
                if (Array.isArray(reporterConfig) &&
                    reporterConfig[0] === '@trunkio/trunk-playwright-reporter') {
                    testOpts = reporterConfig[1];
                    break;
                }
            }
        }

        if (testOpts && testOpts["outputFile"]) {
            this.outputFile = testOpts["outputFile"];
        } else if (process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE) {
            this.outputFile = process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE;
        }
    }

    private getOrCreateTestSuite(filePath: string, suiteName: string) {
        if (!this.testSuites.has(filePath)) {
            // Use the suite name (describe block text) as the testsuite name
            const testSuite = builder.testSuite()
                .name(suiteName)
                .timestamp(new Date().toISOString());
            this.testSuites.set(filePath, testSuite);
        }
        return this.testSuites.get(filePath);
    }

    onTestBegin(test: TestCase, _result: TestResult) {
        // This method is called for each test, but we don't need to do anything here
        // as we'll handle test suite creation in onTestEnd
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const filePath = test.location?.file || 'unknown-file';
        const suiteName = test.parent?.title || 'Unknown Suite';

        // Get or create the test suite for this file
        const testSuite = this.getOrCreateTestSuite(filePath, suiteName);

        // Extract just the filename from the path for the classname
        const fileName = filePath.split('/').pop() || filePath;

        const junit = testSuite.testCase()
            .name(test.title || 'Unknown Test')
            .time(result.duration)
            .file(filePath)
            .className(fileName);

        switch (result.status) {
            case "failed":
                this.hasFailures = true;
                junit.failure(result.error?.message || "Test failed due to unknown error", "FAILURE").stacktrace(result.error?.stack)
                break
            case 'timedOut':
                this.hasFailures = true;
                junit.failure(result.error?.message || "Test timed out", "TIMEOUT")
                break
            case "interrupted":
                this.hasFailures = true;
                junit.failure(result.error?.message || "Test interrupted", "INTERRUPTED")
                break
            case 'skipped':
                junit.skipped()
                break;
            case 'passed':
                break
        }
    }

    onEnd(result: FullResult) {
        // Note: junit-report-builder doesn't support setting time on the root level
        // The time is calculated automatically from the test suites

        builder.writeTo(this.outputFile);

        // Use setTimeout to ensure the report is written before exiting
        setTimeout(() => {
            process.exit(this.hasFailures ? 1 : 0);
        }, 500);
    }
}

export default TrunkReporter;
