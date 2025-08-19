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

    onBegin(config: FullConfig, suite: Suite) {
        this.testSuite.timestamp(new Date().toISOString());
    }

    onTestBegin(test: TestCase, _result: TestResult) {
        this.testSuite.name(test.parent?.title || 'playwright tests')
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const junit = this.testSuite.testCase()
            .name(test.title || 'Unknown Test')
            .time(result.duration)
            .file(test.location?.file || 'unknown-file')
            .className(test.parent?.title || 'Unknown Suite');

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
        this.testSuite.time(result.duration);
        builder.writeTo(process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE as string || 'junit.xml');
        
        // Use setTimeout to ensure the report is written before exiting
        setTimeout(() => {
            process.exit(this.hasFailures ? 1 : 0);
        }, 500);
}
}

export default TrunkReporter;
