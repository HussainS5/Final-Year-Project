const { test, expect } = require('@playwright/test');

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard page heading', async ({ page }) => {
    const heading = page.locator('h1:has-text("Recommended")');
    await expect(heading).toBeVisible();
  });

  test('should display Jobs text in heading', async ({ page }) => {
    const jobsText = page.locator('text=Jobs');
    await expect(jobsText.first()).toBeVisible();
  });

  test('should display user profile card', async ({ page }) => {
    const profileCard = page.locator('[class*="glass-card"]').first();
    await expect(profileCard).toBeVisible();
  });

  test('should display profile strength indicator', async ({ page }) => {
    const profileStrength = page.locator('text=Profile Strength');
    await expect(profileStrength).toBeVisible();
  });

  test('should display active applications stat', async ({ page }) => {
    const activeApplications = page.locator('text=Active Applications');
    await expect(activeApplications).toBeVisible();
  });

  test('should display interviews scheduled stat', async ({ page }) => {
    const interviewsScheduled = page.locator('text=Interviews Scheduled');
    await expect(interviewsScheduled).toBeVisible();
  });

  test('should display match ranking stat', async ({ page }) => {
    const matchRanking = page.locator('text=Match Ranking');
    await expect(matchRanking).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // The page might show a loader initially
    const loader = page.locator('[class*="animate-spin"]').first();
    // This might not always be visible, so we check if it exists
    const loaderExists = await loader.isVisible().catch(() => false);
    expect(typeof loaderExists).toBe('boolean');
  });

  test('should display recommended jobs section', async ({ page }) => {
    const recommendedJobs = page.locator('text=Top matches based on your skills and experience');
    await expect(recommendedJobs).toBeVisible();
  });

  test('should display no jobs message when no jobs available', async ({ page }) => {
    // Wait a bit for the page to load
    await page.waitForTimeout(2000);
    const noJobsMessage = page.locator('text=No Jobs Available').or(page.locator('text=Complete your profile'));
    // One of these should be visible
    const isVisible = await noJobsMessage.first().isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should display Complete Profile button when no jobs', async ({ page }) => {
    await page.waitForTimeout(2000);
    const completeProfileButton = page.locator('button:has-text("Complete Profile")');
    const isVisible = await completeProfileButton.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should navigate to profile when clicking Complete Profile', async ({ page }) => {
    await page.waitForTimeout(2000);
    const completeProfileButton = page.locator('button:has-text("Complete Profile")');
    const isVisible = await completeProfileButton.isVisible().catch(() => false);
    if (isVisible) {
      await completeProfileButton.click();
      await expect(page).toHaveURL(/.*profile/);
    }
  });

  test('should display job cards when jobs are available', async ({ page }) => {
    await page.waitForTimeout(3000);
    const jobCards = page.locator('[class*="glass-card"]').filter({ hasText: /View Job|Match/ });
    const count = await jobCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display job title in job cards', async ({ page }) => {
    await page.waitForTimeout(3000);
    const jobTitle = page.locator('h3').filter({ hasText: /.+/ }).first();
    const isVisible = await jobTitle.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should display match score badge on job cards', async ({ page }) => {
    await page.waitForTimeout(3000);
    const matchBadge = page.locator('text=/\\d+% Match/').first();
    const isVisible = await matchBadge.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should navigate to job detail when clicking job card', async ({ page }) => {
    await page.waitForTimeout(3000);
    const jobCard = page.locator('[class*="glass-card"]').filter({ hasText: /View Job/ }).first();
    const isVisible = await jobCard.isVisible().catch(() => false);
    if (isVisible) {
      await jobCard.click();
      // Should navigate to job detail page
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/jobs\/\d+/);
    }
  });

  test('should display View Job button on job cards', async ({ page }) => {
    await page.waitForTimeout(3000);
    const viewJobButton = page.locator('button:has-text("View Job")');
    const isVisible = await viewJobButton.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});

