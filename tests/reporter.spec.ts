import {describe, expect, test} from "bun:test";
import {$, file} from "bun";

describe("Trunk Reporter Output", () => {
    test('Includes total tests count', async () => {
        //await $`bun run target-tests`
        const contents = await file(`./tests/target/report.xml`).text()
        expect(contents).toContain("name=\"playwright tests\"")
    })
})