import {beforeAll, describe, expect, test} from "bun:test";
import {file} from "bun";
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
        const totalTestCount = parsedXml["testsuites"]["@@tests"];
        expect(totalTestCount).toBe("3")
    })

    test('Test names match test titles', () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        let testName = tests[0]["@@name"]
        expect(testName).toBe("home page has expected h1")

        testName = tests[1]["@@name"]
        expect(testName).toBe("home page has expected p")
    })

    test("Contains the correct number of expected failures", () => {
        const failures = parsedXml["testsuites"]["@@failures"];
        expect(failures).toBe("1")
    })

    test("Expected failure includes failure reason", () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        const failingTest = tests[2]
        expect(failingTest.failure).toBeDefined()
        expect(failingTest.failure['@@message']).toContain("locator('h2')&#xA;Expected: visible&#xA;Received: <element(s) not found>")
    })

    //
    // test('Classname matches', () => {
    //
    // })
    //
    // test('Has filepath', () => {
    //
    // })
    //
    // test('Total test duration is set', () => {
    //
    // })
    //
    // test('Test durations for individual tests', () => {
    //
    // })
    //
    // test('Test durations for individual tests', () => {
    //
    // })
    //
    test('Timestamps adhere to ISO 8601 format', () => {

    })
})