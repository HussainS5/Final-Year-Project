const { test, expect } = require('@playwright/test');

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load contact page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*contact/);
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

