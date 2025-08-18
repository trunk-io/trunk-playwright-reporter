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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTestBegin(_test: TestCase, _result: TestResult) {
        this.testSuite.timestamp(new Date(Date.now()).toISOString());
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const testCase = this.testSuite
            .testCase()

        switch (result.status) {
            case "failed":
            case 'timedOut':
            case "interrupted":
                testCase.failure(result.error?.message)
                break
            case 'skipped':
                testCase.skipped()
                break;
            case 'passed':
                break
        }

        testCase
            .name(test.title)
            .time(result.duration)
            .file(test.location.file)
            .className(test.parent.title)
    }

    onEnd(result: FullResult) {
        this.testSuite.time(result.duration);
        builder.writeTo('report.xml');
    }
}

export default TrunkReporter;
