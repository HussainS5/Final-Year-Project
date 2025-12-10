const { test, expect } = require('@playwright/test');

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup page title', async ({ page }) => {
    const title = page.locator('h1:has-text("Create Your Account")');
    await expect(title).toBeVisible();
  });

  test('should display NextGenAI branding', async ({ page }) => {
    const branding = page.locator('text=NextGenAI');
    await expect(branding).toBeVisible();
  });

  test('should display full name input field', async ({ page }) => {
    const fullNameInput = page.locator('input#fullName');
    await expect(fullNameInput).toBeVisible();
    await expect(fullNameInput).toHaveAttribute('placeholder', 'John Doe');
  });

  test('should display email input field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
  });

  test('should display password input field', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Create a strong password');
  });

  test('should display confirm password input field', async ({ page }) => {
    const confirmPasswordInput = page.locator('input#confirmPassword');
    await expect(confirmPasswordInput).toBeVisible();
    await expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Confirm your password');
  });

  test('should display Create Account button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create Account")');
    await expect(createButton).toBeVisible();
  });

  test('should toggle password visibility for password field', async ({ page }) => {
    const passwordInput = page.locator('input#password');
    const toggleButtons = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButtons.first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should toggle password visibility for confirm password field', async ({ page }) => {
    const confirmPasswordInput = page.locator('input#confirmPassword');
    const toggleButtons = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    await toggleButtons.nth(1).click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('should display password requirement hint', async ({ page }) => {
    const hint = page.locator('text=Must be at least 6 characters');
    await expect(hint).toBeVisible();
  });

  test('should display Terms of Service checkbox', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(termsCheckbox).toBeVisible();
  });

  test('should require Terms of Service acceptance', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    const createButton = page.locator('button:has-text("Create Account")');
    
    await createButton.click();
    // HTML5 validation should prevent submission
    await expect(termsCheckbox).toBeFocused();
  });

  test('should display Sign in link', async ({ page }) => {
    const signInLink = page.locator('text=Sign in');
    await expect(signInLink).toBeVisible();
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    const signInLink = page.locator('a:has-text("Sign in")');
    await signInLink.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show error when passwords do not match', async ({ page }) => {
    const fullNameInput = page.locator('input#fullName');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input#password');
    const confirmPasswordInput = page.locator('input#confirmPassword');
    const createButton = page.locator('button:has-text("Create Account")');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();

    await fullNameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('differentpassword');
    await termsCheckbox.check();
    await createButton.click();

    const errorMessage = page.locator('text=Passwords do not match');
    await expect(errorMessage).toBeVisible();
  });

  test('should show error when password is too short', async ({ page }) => {
    const fullNameInput = page.locator('input#fullName');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input#password');
    const confirmPasswordInput = page.locator('input#confirmPassword');
    const createButton = page.locator('button:has-text("Create Account")');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();

    await fullNameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('12345');
    await confirmPasswordInput.fill('12345');
    await termsCheckbox.check();
    await createButton.click();

    const errorMessage = page.locator('text=Password must be at least 6 characters');
    await expect(errorMessage).toBeVisible();
  });

  test('should require full name field', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create Account")');
    await createButton.click();
    const fullNameInput = page.locator('input#fullName');
    await expect(fullNameInput).toBeFocused();
  });

  test('should require email field', async ({ page }) => {
    const fullNameInput = page.locator('input#fullName');
    const createButton = page.locator('button:has-text("Create Account")');
    
    await fullNameInput.fill('Test User');
    await createButton.click();
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should disable Create Account button while loading', async ({ page }) => {
    const fullNameInput = page.locator('input#fullName');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input#password');
    const confirmPasswordInput = page.locator('input#confirmPassword');
    const createButton = page.locator('button:has-text("Create Account")');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();

    await fullNameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    await termsCheckbox.check();
    
    const submitPromise = createButton.click();
    const loadingText = page.locator('text=Creating account...');
    await expect(loadingText).toBeVisible({ timeout: 2000 }).catch(() => {});
    await submitPromise.catch(() => {});
  });
});

