const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Transform Your Career');
  });

  test('should display the subtitle text', async ({ page }) => {
    const subtitle = page.locator('text=Upload your resume and let our advanced AI');
    await expect(subtitle).toBeVisible();
  });

  test('should display Upload Resume button', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload Resume")');
    await expect(uploadButton).toBeVisible();
  });

  test('should display Explore Dashboard button', async ({ page }) => {
    const dashboardButton = page.locator('button:has-text("Explore Dashboard")');
    await expect(dashboardButton).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    const statsCards = page.locator('[class*="glass-card"]').filter({ hasText: /Active Jobs|Active Users|Success Rate/ });
    await expect(statsCards).toHaveCount(3);
  });

  test('should display Active Jobs stat', async ({ page }) => {
    const activeJobs = page.locator('text=Active Jobs');
    await expect(activeJobs).toBeVisible();
  });

  test('should display Active Users stat', async ({ page }) => {
    const activeUsers = page.locator('text=Active Users');
    await expect(activeUsers).toBeVisible();
  });

  test('should display Success Rate stat', async ({ page }) => {
    const successRate = page.locator('text=Success Rate');
    await expect(successRate).toBeVisible();
  });

  test('should display How It Works section', async ({ page }) => {
    const howItWorks = page.locator('text=How It Works');
    await expect(howItWorks).toBeVisible();
  });

  test('should display step 01 - Upload Resume', async ({ page }) => {
    const step01 = page.locator('text=01').first();
    await expect(step01).toBeVisible();
    const uploadResume = page.locator('text=Upload Resume').nth(1);
    await expect(uploadResume).toBeVisible();
  });

  test('should display step 02 - Get Matched', async ({ page }) => {
    const step02 = page.locator('text=02');
    await expect(step02).toBeVisible();
    const getMatched = page.locator('text=Get Matched');
    await expect(getMatched).toBeVisible();
  });

  test('should display step 03 - Grow Skills', async ({ page }) => {
    const step03 = page.locator('text=03');
    await expect(step03).toBeVisible();
    const growSkills = page.locator('text=Grow Skills');
    await expect(growSkills).toBeVisible();
  });

  test('should navigate to signup when clicking Upload Resume while not logged in', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload Resume")');
    await uploadButton.click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should navigate to signup when clicking Explore Dashboard while not logged in', async ({ page }) => {
    const dashboardButton = page.locator('button:has-text("Explore Dashboard")');
    await dashboardButton.click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have NextGenAI branding visible', async ({ page }) => {
    const branding = page.locator('text=NextGenAI');
    await expect(branding.first()).toBeVisible();
  });
});

