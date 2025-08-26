import {beforeAll, describe, expect, test, beforeEach} from 'bun:test';
import {$, file} from 'bun';
import {type X2jOptions, XMLParser} from 'fast-xml-parser';
import {TrunkReporter} from '../src/reporter';
import type {TestCase, TestResult, Suite, FullConfig} from '@playwright/test/reporter';

// Helper functions to create mock objects for resilience tests
function createMockTestCase(id: string = 'test-1', title: string = 'Test Title'): TestCase {
    return {
        id,
        title,
        location: {file: 'test.spec.ts', line: 1, column: 1},
        parent: {title: 'Test Suite'},
        annotations: [],
        tags: [],
        retry: 0,
        repeatEachIndex: 0,
        projectName: 'default',
        expectedStatus: 'passed',
        timeout: 30000
    } as unknown as TestCase;
}

function createMockTestResult(status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted' = 'passed'): TestResult {
    return {
        status,
        duration: 100,
        error: status === 'failed' ? new Error('Test failed') : undefined,
        attachments: [],
        stdout: [],
        stderr: [],
        retry: 0,
        startTime: new Date(),
        endTime: new Date()
    } as unknown as TestResult;
}

function createMockSuite(type: 'root' | 'describe' = 'root', title: string = 'Test Suite'): Suite {
    return {
        type,
        title,
        location: {file: 'test.spec.ts', line: 1, column: 1},
        parent: type === 'describe' ? createMockSuite('root') : undefined,
        children: [],
        allTests: [],
        projectName: 'default'
    } as unknown as Suite;
}

describe("Reporter Junit Output", () => {
    let parsedXml: any;

    beforeAll(async () => {
        const content = await file(`test/target/output.xml`).text()
        const options: X2jOptions = {
            attributeNamePrefix: "@@",
            ignoreAttributes: false
        }
        const parser = new XMLParser(options);
        parsedXml = parser.parse(content)
    })

    test('Contains the correct number of tests', async () => {
        const total = parsedXml["testsuites"]["@@tests"];
        expect(total).toBe("12")
    })

    test('Contains the correct number of skipped tests', async () => {
        const skips = parsedXml["testsuites"]["@@skipped"];
        expect(skips).toBe("1")
    })

    test("Contains the correct number of expected failures", () => {
        const failures = parsedXml["testsuites"]["@@failures"];
        expect(failures).toBe("5")
    })

    test('Contains the correct number of errored tests', async () => {
        const errors = parsedXml["testsuites"]["@@errors"];
        expect(errors).toBe("0")
    })

    test("Test failure includes the reason", () => {
        // Find the specific failing test we're looking for
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let failingTest = null;
        
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                failingTest = testCases.find((test: any) => 
                    test["@@name"] === "home page has expected h2 (failure intended)"
                );
                if (failingTest) break;
            }
        }
        
        expect(failingTest).toBeDefined();
        expect(failingTest.failure).toBeDefined();
        expect(failingTest.failure['@@message']).toContain("locator('h2')&#xA;Expected: visible&#xA;Received: <element(s) not found>")
    })

    test('`name` attribute matches title argument passed to `test()`', () => {
        // Find specific tests by name across all test suites
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let testName = null;
        
        // Find the "home page has expected h1" test
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                const test = testCases.find((t: any) => t["@@name"] === "home page has expected h1");
                if (test) {
                    testName = test["@@name"];
                    break;
                }
            }
        }
        expect(testName).toBe("home page has expected h1")

        // Find the "home page has expected p" test
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                const test = testCases.find((t: any) => t["@@name"] === "home page has expected p");
                if (test) {
                    testName = test["@@name"];
                    break;
                }
            }
        }
        expect(testName).toBe("home page has expected p")
    })

    test('`classname` attribute matches title argument passed to `test.describe()`', () => {
        // Find the specific test to check its classname
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let testClassname = null;
        
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                const test = testCases.find((t: any) => t["@@name"] === "home page has expected h1");
                if (test) {
                    testClassname = test["@@classname"];
                    break;
                }
            }
        }
        expect(testClassname).toBe("basic-functionality.test.ts")
    })

    test('`file` attribute is set to path of file containing the test', async () => {
        // Find the specific test to check its file path
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let filename = null;
        
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                const test = testCases.find((t: any) => t["@@name"] === "home page has expected h1");
                if (test) {
                    filename = test["@@file"];
                    break;
                }
            }
        }
        const wd = await $`pwd`.text()
        const cleanPath = wd.substring(0, wd.indexOf('\n'))
        expect(filename).toBe(`${cleanPath}/test/target/e2e/basic-functionality.test.ts`)
    })

    test('`time` attribute is set', () => {
        // Find the first test across all test suites
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let time = null;
        
        for (const suite of testSuites) {
            if (suite.testcase) {
                const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
                if (testCases.length > 0) {
                    time = testCases[0]["@@time"];
                    break;
                }
            }
        }
        expect(time).toBeDefined()
        expect(time).not.toBeEmpty()
    })

    test('Test suite contains ISO 8601 timestamp', () => {
        // Check that at least one test suite has a timestamp
        const testSuites = parsedXml["testsuites"]["testsuite"] as any[];
        let hasTimestamp = false;
        
        for (const suite of testSuites) {
            if (suite["@@timestamp"]) {
                hasTimestamp = true;
                const timestamp = suite["@@timestamp"];
                expect(timestamp).toBeDefined()
                expect(timestamp).not.toBeEmpty()
                const dt = new Date(timestamp)
                expect(dt.toString()).not.toBe("Invalid Date")
                break;
            }
        }
        
        expect(hasTimestamp).toBe(true)
    })
})

describe('Reporter Resilience Tests', () => {
    let reporter: TrunkReporter;

    beforeEach(() => {
        reporter = new TrunkReporter();
    });

    describe('Interrupt Tests', () => {
        test('handles interrupted tests with custom error message', () => {
            const mockTest = createMockTestCase('interrupted-test', 'Interrupted Test');
            const mockResult = {
                ...createMockTestResult('interrupted'),
                error: new Error('User interrupted the test execution')
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles interrupted tests with stack trace', () => {
            const mockTest = createMockTestCase('interrupted-stack-test', 'Interrupted Stack Test');
            const error = new Error('Test was interrupted');
            error.stack = 'Error: Test was interrupted\n    at Test.run (/path/to/test.js:10:15)';
            
            const mockResult = {
                ...createMockTestResult('interrupted'),
                error
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles interrupted tests with undefined error', () => {
            const mockTest = createMockTestCase('interrupted-no-error', 'Interrupted No Error Test');
            const mockResult = {
                ...createMockTestResult('interrupted'),
                error: undefined
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('interrupted tests set hasFailures flag', () => {
            const mockTest = createMockTestCase('interrupted-flag-test', 'Interrupted Flag Test');
            const mockResult = createMockTestResult('interrupted');

            reporter.onTestBegin(mockTest, mockResult);
            reporter.onTestEnd(mockTest, mockResult);

            // Access private property for testing
            const hasFailures = (reporter as any).hasFailures;
            expect(hasFailures).toBe(true);
        });
    });

    describe('Skip Tests', () => {
        test('handles skipped tests with custom reason', () => {
            const mockTest = createMockTestCase('skipped-test', 'Skipped Test');
            const mockResult = createMockTestResult('skipped');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles skipped tests with annotations', () => {
            const mockTest = {
                ...createMockTestCase('skipped-annotation-test', 'Skipped Annotation Test'),
                annotations: [{type: 'skip', description: 'Test is flaky in CI'}]
            } as unknown as TestCase;
            const mockResult = createMockTestResult('skipped');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('skipped tests do not set hasFailures flag', () => {
            const mockTest = createMockTestCase('skipped-flag-test', 'Skipped Flag Test');
            const mockResult = createMockTestResult('skipped');

            reporter.onTestBegin(mockTest, mockResult);
            reporter.onTestEnd(mockTest, mockResult);

            // Access private property for testing
            const hasFailures = (reporter as any).hasFailures;
            expect(hasFailures).toBe(false);
        });

        test('handles multiple skipped tests in sequence', () => {
            const tests = [
                {id: 'skip-1', title: 'First Skipped Test'},
                {id: 'skip-2', title: 'Second Skipped Test'},
                {id: 'skip-3', title: 'Third Skipped Test'}
            ];

            tests.forEach(({id, title}) => {
                const mockTest = createMockTestCase(id, title);
                const mockResult = createMockTestResult('skipped');

                expect(() => {
                    reporter.onTestBegin(mockTest, mockResult);
                    reporter.onTestEnd(mockTest, mockResult);
                }).not.toThrow();
            });
        });
    });

    describe('Failure Reason Tests', () => {
        test('handles failure with detailed error message', () => {
            const mockTest = createMockTestCase('detailed-failure', 'Detailed Failure Test');
            const detailedError = new Error('Assertion failed: Expected element to be visible but it was hidden');
            detailedError.stack = 'Error: Assertion failed\n    at expect.toBeVisible (/path/to/test.js:25:10)';
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: detailedError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with custom error type', () => {
            const mockTest = createMockTestCase('custom-error-failure', 'Custom Error Failure Test');
            const customError = new Error('Custom assertion error');
            (customError as any).type = 'AssertionError';
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: customError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with multiline error message', () => {
            const mockTest = createMockTestCase('multiline-failure', 'Multiline Failure Test');
            const multilineError = new Error('Multiple lines\nof error\ninformation');
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: multilineError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with special characters in error message', () => {
            const mockTest = createMockTestCase('special-chars-failure', 'Special Chars Failure Test');
            const specialCharsError = new Error('Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: specialCharsError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with unicode characters in error message', () => {
            const mockTest = createMockTestCase('unicode-failure', 'Unicode Failure Test');
            const unicodeError = new Error('Error with unicode: 🚀🌟🎉中文日本語한국어');
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: unicodeError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with very long error message', () => {
            const mockTest = createMockTestCase('long-error-failure', 'Long Error Failure Test');
            const longError = new Error('A'.repeat(10000)); // Very long error message
            
            const mockResult = {
                ...createMockTestResult('failed'),
                error: longError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with undefined error message', () => {
            const mockTest = createMockTestCase('undefined-error-failure', 'Undefined Error Failure Test');
            const mockResult = {
                ...createMockTestResult('failed'),
                error: undefined
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles failure with null error message', () => {
            const mockTest = createMockTestCase('null-error-failure', 'Null Error Failure Test');
            const mockResult = {
                ...createMockTestResult('failed'),
                error: null
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });
    });

    describe('Timeout Tests', () => {
        test('handles timeout with custom error message', () => {
            const mockTest = createMockTestCase('timeout-test', 'Timeout Test');
            const timeoutError = new Error('Test execution timed out after 30 seconds');
            
            const mockResult = {
                ...createMockTestResult('timedOut'),
                error: timeoutError
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles timeout with stack trace', () => {
            const mockTest = createMockTestCase('timeout-stack-test', 'Timeout Stack Test');
            const error = new Error('Test timed out');
            error.stack = 'Error: Test timed out\n    at Test.run (/path/to/test.js:30:20)';
            
            const mockResult = {
                ...createMockTestResult('timedOut'),
                error
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('timeout tests set hasFailures flag', () => {
            const mockTest = createMockTestCase('timeout-flag-test', 'Timeout Flag Test');
            const mockResult = createMockTestResult('timedOut');

            reporter.onTestBegin(mockTest, mockResult);
            reporter.onTestEnd(mockTest, mockResult);

            // Access private property for testing
            const hasFailures = (reporter as any).hasFailures;
            expect(hasFailures).toBe(true);
        });

        test('handles timeout with undefined error', () => {
            const mockTest = createMockTestCase('timeout-no-error', 'Timeout No Error Test');
            const mockResult = {
                ...createMockTestResult('timedOut'),
                error: undefined
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });
    });

    describe('Mixed Status Tests', () => {
        test('handles mixed test statuses correctly', () => {
            const testScenarios = [
                {id: 'test-1', title: 'Passing Test', status: 'passed' as const},
                {id: 'test-2', title: 'Failing Test', status: 'failed' as const},
                {id: 'test-3', title: 'Skipped Test', status: 'skipped' as const},
                {id: 'test-4', title: 'Timeout Test', status: 'timedOut' as const},
                {id: 'test-5', title: 'Interrupted Test', status: 'interrupted' as const}
            ];

            testScenarios.forEach(({id, title, status}) => {
                const mockTest = createMockTestCase(id, title);
                const mockResult = createMockTestResult(status);

                expect(() => {
                    reporter.onTestBegin(mockTest, mockResult);
                    reporter.onTestEnd(mockTest, mockResult);
                }).not.toThrow();
            });
        });

        test('hasFailures flag is set when any test fails, times out, or is interrupted', () => {
            const failingTests = [
                {id: 'fail-1', title: 'First Failure', status: 'failed' as const},
                {id: 'timeout-1', title: 'First Timeout', status: 'timedOut' as const},
                {id: 'interrupt-1', title: 'First Interrupt', status: 'interrupted' as const}
            ];

            failingTests.forEach(({id, title, status}) => {
                const mockTest = createMockTestCase(id, title);
                const mockResult = createMockTestResult(status);

                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            });

            // Access private property for testing
            const hasFailures = (reporter as any).hasFailures;
            expect(hasFailures).toBe(true);
        });

        test('hasFailures flag remains false when only passing and skipped tests', () => {
            const passingTests = [
                {id: 'pass-1', title: 'First Pass', status: 'passed' as const},
                {id: 'skip-1', title: 'First Skip', status: 'skipped' as const},
                {id: 'pass-2', title: 'Second Pass', status: 'passed' as const}
            ];

            passingTests.forEach(({id, title, status}) => {
                const mockTest = createMockTestCase(id, title);
                const mockResult = createMockTestResult(status);

                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            });

            // Access private property for testing
            const hasFailures = (reporter as any).hasFailures;
            expect(hasFailures).toBe(false);
        });
    });

    describe('Error Handling Tests', () => {
        test('handles missing test location gracefully', () => {
            const mockTest = {
                ...createMockTestCase(),
                location: undefined
            } as unknown as TestCase;
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles missing error messages gracefully', () => {
            const mockTest = createMockTestCase();
            const mockResult = {
                ...createMockTestResult('failed'),
                error: undefined
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles missing test parent gracefully', () => {
            const mockTest = {
                ...createMockTestCase(),
                parent: undefined
            } as unknown as TestCase;
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles missing test title gracefully', () => {
            const mockTest = {
                ...createMockTestCase(),
                title: undefined
            } as unknown as TestCase;
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles all test status types without crashing', () => {
            const statuses: Array<'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted'> = [
                'passed', 'failed', 'skipped', 'timedOut', 'interrupted'
            ];

            statuses.forEach(status => {
                const mockTest = createMockTestCase(`test-${status}`);
                const mockResult = createMockTestResult(status);

                expect(() => {
                    reporter.onTestBegin(mockTest, mockResult);
                    reporter.onTestEnd(mockTest, mockResult);
                }).not.toThrow();
            });
        });
    });

    describe('Edge Case Tests', () => {
        test('handles empty test suites', () => {
            const emptySuite = createMockSuite('root', 'Empty Suite');
            const mockConfig = {
                reporter: [
                    ['list'],
                    ['@trunkio/trunk-playwright-reporter', { outputFile: 'test-output.xml' }]
                ]
            } as unknown as FullConfig;

            expect(() => {
                reporter.onBegin(mockConfig, emptySuite);
            }).not.toThrow();
        });

        test('handles tests with very long titles', () => {
            const longTitle = 'A'.repeat(10000); // Very long title
            const mockTest = createMockTestCase('test-1', longTitle);
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles tests with special characters in titles', () => {
            const specialTitle = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const mockTest = createMockTestCase('test-1', specialTitle);
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles tests with unicode characters', () => {
            const unicodeTitle = 'Test with unicode: 🚀🌟🎉中文日本語한국어';
            const mockTest = createMockTestCase('test-1', unicodeTitle);
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles tests with zero duration', () => {
            const mockTest = createMockTestCase();
            const mockResult = {
                ...createMockTestResult('passed'),
                duration: 0
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles tests with very long duration', () => {
            const mockTest = createMockTestCase();
            const mockResult = {
                ...createMockTestResult('passed'),
                duration: Number.MAX_SAFE_INTEGER
            } as unknown as TestResult;

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles missing file paths gracefully', () => {
            const mockTest = {
                ...createMockTestCase(),
                location: {file: undefined, line: 1, column: 1}
            } as unknown as TestCase;
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });

        test('handles tests with missing suite information', () => {
            const mockTest = {
                ...createMockTestCase(),
                parent: {title: undefined}
            } as unknown as TestCase;
            const mockResult = createMockTestResult('passed');

            expect(() => {
                reporter.onTestBegin(mockTest, mockResult);
                reporter.onTestEnd(mockTest, mockResult);
            }).not.toThrow();
        });
    });
});
