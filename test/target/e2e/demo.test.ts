import {expect, test} from '@playwright/test';

test.describe('Demo Test Suite', () => {
    test('demo test to verify file structure', async ({page}) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible();
    });
});

