import {expect, test} from '@playwright/test';

test.describe('Failure Scenarios Tests', () => {
    test('test with detailed assertion failure', async ({page}) => {
        await page.goto('/');
        // This will fail with a detailed error message
        await expect(page.locator('h1')).toHaveText('Expected Text That Does Not Exist');
    });

    test('test with element not found error', async ({page}) => {
        await page.goto('/');
        // This will fail with element not found error
        await expect(page.locator('non-existent-element')).toBeVisible();
    });

    test('test with multiple assertion failures', async ({page}) => {
        await page.goto('/');
        // Multiple assertions that will fail
        await expect(page.locator('h1')).toHaveText('Wrong Text');
        await expect(page.locator('p')).toHaveText('Also Wrong');
        await expect(page.locator('h2')).toBeVisible();
    });
});
