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
    private rootSuite: Suite | null = null;

    onBegin(config: FullConfig, suite: Suite) {
        this.rootSuite = suite;
        // Note: junit-report-builder doesn't support setting timestamp on the root level
    }

    private getOrCreateTestSuite(filePath: string, suiteName: string) {
        if (!this.testSuites.has(filePath)) {
            // Extract just the filename from the path for better readability
            const fileName = filePath.split('/').pop() || filePath;
            const testSuite = builder.testSuite()
                .name(fileName)
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
        
        const junit = testSuite.testCase()
            .name(test.title || 'Unknown Test')
            .time(result.duration)
            .file(filePath)
            .className(suiteName);

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
        
        builder.writeTo(process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE as string || 'junit.xml');
        
        // Use setTimeout to ensure the report is written before exiting
        setTimeout(() => {
            process.exit(this.hasFailures ? 1 : 0);
        }, 500);
    }
}

export default TrunkReporter;
