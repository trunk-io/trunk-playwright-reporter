import {beforeAll, describe, expect, test} from "bun:test";
import {$, file} from "bun";
import {type X2jOptions, XMLParser} from "fast-xml-parser";

describe("`demo.test.ts` test report", () => {
    let parsedXml: string;

    beforeAll(async () => {
        const content = await file(`test/target/report.xml`).text()
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
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        const failingTest = tests[2]
        expect(failingTest.failure).toBeDefined()
        expect(failingTest.failure['@@message']).toContain("locator('h2')&#xA;Expected: visible&#xA;Received: <element(s) not found>")
    })

    test('`name` attribute matches title argument passed to `test()`', () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        let testName = tests[0]["@@name"]
        expect(testName).toBe("home page has expected h1")

        testName = tests[1]["@@name"]
        expect(testName).toBe("home page has expected p")
    })

    test('`classname` attribute matches title argument passed to `test.describe()`', () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        const testClassname = tests[0]["@@classname"]
        expect(testClassname).toBe("Tests defined within`test.describe()`")
    })

    test('`file` attribute is set to path of file containing the test', async () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        let filename = tests[0]["@@file"]
        const wd = await $`pwd`.text()
        const cleanPath = wd.substring(0, wd.indexOf('\n'))
        expect(filename).toBe(`${cleanPath}/test/target/e2e/demo.test.ts`)
    })

    test('`time` attribute is set', () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
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
