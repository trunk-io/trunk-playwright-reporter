import { expect, test } from '@playwright/test';

test.describe('Demo test suite', () => {
	test('home page has expected h1', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('home page has expected p', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('p')).toBeVisible();
	});

	test('home page has expected h2', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h2')).toBeVisible();
	});

    // Including this test causes `junit-report-builder` to render incorrect output
	// test.skip('home page has expected p', async ({ page }) => {
	// 		await page.goto('/');
	// 		await expect(page.locator('p')).toBeVisible();
	// });
});
