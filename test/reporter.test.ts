import { beforeAll, describe, expect, test, beforeEach } from 'bun:test';
import { $, file } from 'bun';
import { type X2jOptions, XMLParser } from 'fast-xml-parser';
import { TrunkReporter } from '../src/reporter';
import type { TestCase, TestResult, Suite, FullConfig, FullResult } from '@playwright/test/reporter';

// Helper functions to create mock objects for resilience tests
function createMockTestCase(id: string = 'test-1', title: string = 'Test Title'): TestCase {
  return {
    id,
    title,
    location: { file: 'test.spec.ts', line: 1, column: 1 },
    parent: { title: 'Test Suite' },
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
    location: { file: 'test.spec.ts', line: 1, column: 1 },
    parent: type === 'describe' ? createMockSuite('root') : undefined,
    children: [],
    allTests: [],
    projectName: 'default'
  } as unknown as Suite;
}

describe("Reporter Junit Output", () => {
  let parsedXml: any;

  beforeAll(async () => {
    const content = await file(`test/target/junit.xml`).text()
    const options: X2jOptions = {
      attributeNamePrefix: "@@",
      ignoreAttributes: false
    }
    const parser = new XMLParser(options);
    parsedXml = parser.parse(content)
  })

  test('Contains the correct number of tests', async () => {
    const total = parsedXml["testsuites"]["@@tests"];
    expect(total).toBe("3")
  })

  test('Contains the correct number of skipped tests', async () => {
    const skips = parsedXml["testsuites"]["@@skipped"];
    expect(skips).toBe("0")
  })

  test("Contains the correct number of expected failures", () => {
    const failures = parsedXml["testsuites"]["@@failures"];
    expect(failures).toBe("1")
  })

  test('Contains the correct number of errored tests', async () => {
    const errors = parsedXml["testsuites"]["@@errors"];
    expect(errors).toBe("0")
  })

  test("Test failure includes the reason", () => {
    const tests = parsedXml["testsuites"]["testsuite"]["testcase"] as any[];
    const failingTest = tests[2]
    expect(failingTest.failure).toBeDefined()
    expect(failingTest.failure['@@message']).toContain("locator('h2')&#xA;Expected: visible&#xA;Received: <element(s) not found>")
  })

  test('`name` attribute matches title argument passed to `test()`', () => {
    const tests = parsedXml["testsuites"]["testsuite"]["testcase"] as any[];
    let testName = tests[0]["@@name"]
    expect(testName).toBe("home page has expected h1")

    testName = tests[1]["@@name"]
    expect(testName).toBe("home page has expected p")
  })

  test('`classname` attribute matches title argument passed to `test.describe()`', () => {
    const tests = parsedXml["testsuites"]["testsuite"]["testcase"] as any[];
    const testClassname = tests[0]["@@classname"]
    expect(testClassname).toBe("Tests defined within`test.describe()`")
  })

  test('`file` attribute is set to path of file containing the test', async () => {
    const tests = parsedXml["testsuites"]["testsuite"]["testcase"] as any[];
    let filename = tests[0]["@@file"]
    const wd = await $`pwd`.text()
    const cleanPath = wd.substring(0, wd.indexOf('\n'))
    expect(filename).toBe(`${cleanPath}/test/target/e2e/demo.test.ts`)
  })

  test('`time` attribute is set', () => {
    const tests = parsedXml["testsuites"]["testsuite"]["testcase"] as any[];
    const time = tests[0]["@@time"]
    expect(time).toBeDefined()
    expect(time).not.toBeEmpty()
  })

  test('Test suite contains ISO 8601 timestamp', () => {
    const timestamp = parsedXml["testsuites"]["testsuite"]["@@timestamp"];
    expect(timestamp).toBeDefined()
    expect(timestamp).not.toBeEmpty()
    const dt = new Date(timestamp)
    expect(dt.toString()).not.toBe("Invalid Date")
  })
})

describe('Reporter Resilience Tests', () => {
  let reporter: TrunkReporter;

  beforeEach(() => {
    reporter = new TrunkReporter();
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

  describe('Memory Leak Prevention Tests', () => {
    test('cleans up test cases after completion', () => {
      const test1 = createMockTestCase('test-1');
      const test2 = createMockTestCase('test-2');
      const test3 = createMockTestCase('test-3');

      // Start tests
      reporter.onTestBegin(test1, createMockTestResult());
      reporter.onTestBegin(test2, createMockTestResult());
      reporter.onTestBegin(test3, createMockTestResult());

      expect((reporter as any).testCases.size).toBe(3);

      // Complete tests
      reporter.onTestEnd(test1, createMockTestResult('passed'));
      expect((reporter as any).testCases.size).toBe(2);

      reporter.onTestEnd(test2, createMockTestResult('passed'));
      expect((reporter as any).testCases.size).toBe(1);

      reporter.onTestEnd(test3, createMockTestResult('passed'));
      expect((reporter as any).testCases.size).toBe(0);
    });

    test('handles test completion without start gracefully', () => {
      const mockTest = createMockTestCase('orphan-test');
      const mockResult = createMockTestResult('passed');

      // Try to end a test that was never started
      expect(() => {
        reporter.onTestEnd(mockTest, mockResult);
      }).not.toThrow();

      // Map should remain empty
      expect((reporter as any).testCases.size).toBe(0);
    });

    test('handles duplicate test completion gracefully', () => {
      const mockTest = createMockTestCase('duplicate-test');
      const mockResult = createMockTestResult('passed');

      // Start the test
      reporter.onTestBegin(mockTest, mockResult);
      expect((reporter as any).testCases.size).toBe(1);

      // Complete it once
      reporter.onTestEnd(mockTest, mockResult);
      expect((reporter as any).testCases.size).toBe(0);

      // Try to complete it again
      expect(() => {
        reporter.onTestEnd(mockTest, mockResult);
      }).not.toThrow();

      // Map should still be empty
      expect((reporter as any).testCases.size).toBe(0);
    });

    test('cleans up after many tests', () => {
      const testCount = 100;
      const tests: TestCase[] = [];

      // Create and start many tests
      for (let i = 0; i < testCount; i++) {
        const test = createMockTestCase(`test-${i}`);
        tests.push(test);
        reporter.onTestBegin(test, createMockTestResult());
      }

      expect((reporter as any).testCases.size).toBe(testCount);

      // Complete all tests
      tests.forEach(test => {
        reporter.onTestEnd(test, createMockTestResult('passed'));
      });

      expect((reporter as any).testCases.size).toBe(0);
    });
  });

  describe('Edge Case Tests', () => {
    test('handles empty test suites', () => {
      const emptySuite = createMockSuite('root', 'Empty Suite');

      expect(() => {
        reporter.onBegin({} as FullConfig, emptySuite);
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
        location: { file: undefined, line: 1, column: 1 }
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
        parent: { title: undefined }
      } as unknown as TestCase;
      const mockResult = createMockTestResult('passed');

      expect(() => {
        reporter.onTestBegin(mockTest, mockResult);
        reporter.onTestEnd(mockTest, mockResult);
      }).not.toThrow();
    });
  });
});
