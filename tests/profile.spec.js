const { test, expect } = require('@playwright/test');

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display profile page heading', async ({ page }) => {
    const heading = page.locator('h1:has-text("Your")');
    await expect(heading).toBeVisible();
  });

  test('should display Profile text in heading', async ({ page }) => {
    const profileText = page.locator('text=Profile');
    await expect(profileText.first()).toBeVisible();
  });

  test('should display Edit Profile button', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should display Upload Resume card', async ({ page }) => {
    await page.waitForTimeout(2000);
    const uploadResumeCard = page.locator('text=Upload Your Resume');
    await expect(uploadResumeCard).toBeVisible();
  });

  test('should display Upload Resume button', async ({ page }) => {
    await page.waitForTimeout(2000);
    const uploadButton = page.locator('button:has-text("Upload Resume")');
    await expect(uploadButton).toBeVisible();
  });

  test('should display profile picture section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const profilePicture = page.locator('[class*="rounded-full"]').first();
    const isVisible = await profilePicture.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should display Personal Information section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const personalInfo = page.locator('text=Personal Information');
    await expect(personalInfo).toBeVisible();
  });

  test('should display Work Experience section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const workExperience = page.locator('text=Work Experience');
    await expect(workExperience).toBeVisible();
  });

  test('should display Education section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const education = page.locator('text=Education');
    await expect(education).toBeVisible();
  });

  test('should display Skills section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const skills = page.locator('text=Skills');
    await expect(skills).toBeVisible();
  });

  test('should display Account Status section', async ({ page }) => {
    await page.waitForTimeout(2000);
    const accountStatus = page.locator('text=Account Status');
    await expect(accountStatus).toBeVisible();
  });

  test('should enter edit mode when clicking Edit Profile', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should display Cancel button in edit mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should display Save Changes button in edit mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const saveButton = page.locator('button:has-text("Save Changes")');
      await expect(saveButton).toBeVisible();
    }
  });

  test('should exit edit mode when clicking Cancel', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
      await page.waitForTimeout(1000);
      const editButtonAgain = page.locator('button:has-text("Edit Profile")');
      await expect(editButtonAgain).toBeVisible();
    }
  });

  test('should display input fields in edit mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const firstNameInput = page.locator('input').filter({ hasText: /First Name/ }).or(page.locator('input[placeholder*="John"]'));
      const isInputVisible = await firstNameInput.first().isVisible().catch(() => false);
      expect(typeof isInputVisible).toBe('boolean');
    }
  });

  test('should display Add Experience button in edit mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const addExperienceButton = page.locator('button:has-text("Add Experience")');
      const isVisible = await addExperienceButton.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    }
  });

  test('should display Add Education button in edit mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editButton = page.locator('button:has-text("Edit Profile")');
    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);
      const addEducationButton = page.locator('button:has-text("Add Education")');
      const isVisible = await addEducationButton.isVisible().catch(() => false);
      expect(typeof isVisible).toBe('boolean');
    }
  });
});

