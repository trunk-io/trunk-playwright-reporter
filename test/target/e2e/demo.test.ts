import {expect, test} from '@playwright/test';

test.describe('Tests defined within`test.describe()`', () => {
    test('home page has expected h1', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });

    test('home page has expected p', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('p')).toBeVisible();
    });

    test('home page has expected h2 (failure intended)', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('h2')).toBeVisible();
    });
});

test.describe('Additional test scenarios for comprehensive coverage', () => {
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

test.describe('Edge case tests', () => {
    test('test with very long title that might cause issues', async ({page}) => {
        const longTitle = 'A'.repeat(1000); // Very long test title
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });

    test('test with special characters in title: !@#$%^&*()', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });

    test('test with unicode characters in title: 🚀🌟🎉', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });
});

