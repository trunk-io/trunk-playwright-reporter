import {describe, expect, test} from "bun:test";
import {$, file} from "bun";
import {XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser'
import {q} from "../playwright-tests/.svelte-kit/output/server/chunks";

const parser = new XMLParser();

describe("tester", () => {
    test('test', async () => {
        await $`cd playwright-tests && bun test:e2e`
        const contents = await file(`./playwright-tests/report.xml`).text()
        expect(contents).toContain("<testsuite name=\"playwright tests\"")
    })
})