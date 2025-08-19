import {expect, test} from '@playwright/test';

test.describe('Edge Cases Tests', () => {
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
