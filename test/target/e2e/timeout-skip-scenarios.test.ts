import {expect, test} from '@playwright/test';

test.describe('Timeout and Skip Scenarios Tests', () => {
    test('skipped test with reason', async ({page}) => {
        test.skip(true, 'This test is intentionally skipped for demonstration');
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });

    test('test that will timeout', async ({page}) => {
        test.setTimeout(100); // Very short timeout
        await page.goto('/');
        // This will likely timeout due to the short timeout
        await new Promise(resolve => setTimeout(resolve, 200));
        await expect(page.locator('h1')).toBeVisible();
    });
});
