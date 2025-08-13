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

export default class TrunkReporter implements Reporter {
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
        this.testSuite
            .testCase()
            .name(test.title)
            .time(result.duration)
            .file(test.location.file)
            .className(test.parent.title)

        if (result.status === 'failed') {
            this.testSuite.testCase().failure(result.error?.message)
        }

    }

    onEnd(result: FullResult) {
        this.testSuite.time(result.duration);
        builder.writeTo('report.xml');
    }
}
