import {expect, test} from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
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
