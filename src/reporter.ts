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
    private testSuite = builder.testSuite();
    private hasFailures = false;
    private testCases = new Map<string, any>(); // Store test cases by test ID

    onBegin(config: FullConfig, suite: Suite) {
        switch (suite.type) {
            case 'root':
                this.testSuite.name('playwright tests').timestamp(new Date(Date.now()));
                break;
            case 'describe':
                this.testSuite.name(suite.title);
                break;
        }
    }

    onTestBegin(test: TestCase, _result: TestResult) {
        // Create test case and store start time
        const testCase = this.testSuite.testCase();

        // Store the test case for later completion
        this.testCases.set(test.id, testCase);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        // Get the test case we created earlier
        const testCase = this.testCases.get(test.id);
        if (!testCase) return;

        switch (result.status) {
            case "failed":
            case 'timedOut':
            case "interrupted":
                this.hasFailures = true;
                testCase.failure(result.error?.message)
                break
            case 'skipped':
                testCase.skipped()
                break;
            case 'passed':
                break
        }

        testCase
            .name(test.title || 'Unknown Test')
            .time(result.duration)
            .file(test.location?.file || 'unknown-file')
            .className(test.parent?.title || 'Unknown Suite');
            
        // Clean up the stored test case
        this.testCases.delete(test.id);
    }

    onEnd(result: FullResult) {
        this.testSuite.time(result.duration);
        builder.writeTo(process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE as string || 'junit.xml');
        if (this.hasFailures) {
            // Use setTimeout to ensure the report is written before exiting
            setTimeout(() => {
                process.exit(0);
            }, 500);
        }
    }
}

export default TrunkReporter;
