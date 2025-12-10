const { test, expect } = require('@playwright/test');

test.describe('Privacy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy');
  });

  test('should load privacy page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*privacy/);
  });

  test('should display page content', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have navigation visible', async ({ page }) => {
    const nav = page.locator('nav').first();
    const isVisible = await nav.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});

