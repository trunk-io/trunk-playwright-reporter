import {describe, expect, test} from "bun:test";
import {$, file} from "bun";

describe("Trunk Reporter Output", () => {
    test('Includes total test count', async () => {
        await $`bun run target-tests`
        const contents = await file(`./test/target/report.xml`).text()
        expect(contents).toContain("name=\"playwright tests\"")
    })

    test('Name matches', () => {

    })


    test('Classname matches', () => {

    })

    test('Has filepath', () => {

    })

    test('Total test duration is set', () => {

    })

    test('Test durations for individual tests', () => {

    })

    test('Test durations for individual tests', () => {

    })

})