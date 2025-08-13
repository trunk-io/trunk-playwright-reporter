import {beforeAll, describe, expect, test} from "bun:test";
import {$, file} from "bun";
import {type X2jOptions, XMLParser} from "fast-xml-parser";

describe("Trunk Reporter Output", () => {
    let parsedXml: string;

    beforeAll(async () => {
        const content = await file(`target/report.xml`).text()
        const options: X2jOptions = {
            attributeNamePrefix: "@@",
            ignoreAttributes: false
        }
        const parser = new XMLParser(options);
        parsedXml = parser.parse(content)
    })

    test('Includes total test count', async () => {
        const totalTestCount = parsedXml["testsuites"]["@@tests"];
        expect(totalTestCount).toBe("4")
    })


    test('Name matches', () => {
        const tests = parsedXml["testsuites"]["testsuite"]["testcase"];
        let testName = tests[0]["@@name"]
        expect(testName).toBe("home page has expected h1")

        testName = tests[1]["@@name"]
        expect(testName).toBe("home page has expected p")
    })

    test("Passing tests match", () => {

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
    // test('Timestamps adhere to ISO 8601 format', () => {
    //
    // })
})