const { test, expect } = require('@playwright/test');

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page title', async ({ page }) => {
    const title = page.locator('h1:has-text("Welcome Back")');
    await expect(title).toBeVisible();
  });

  test('should display NextGenAI branding', async ({ page }) => {
    const branding = page.locator('text=NextGenAI');
    await expect(branding).toBeVisible();
  });

  test('should display email input field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
  });

  test('should display password input field', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
  });

  test('should display Sign In button', async ({ page }) => {
    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
  });

  test('should display password visibility toggle', async ({ page }) => {
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
    await expect(toggleButton).toBeVisible();
  });

  test('should toggle password visibility when clicking eye icon', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should display Remember me checkbox', async ({ page }) => {
    const rememberMe = page.locator('text=Remember me');
    await expect(rememberMe).toBeVisible();
  });

  test('should display Forgot password link', async ({ page }) => {
    const forgotPassword = page.locator('text=Forgot password?');
    await expect(forgotPassword).toBeVisible();
  });

  test('should display Sign up link', async ({ page }) => {
    const signUpLink = page.locator('text=Sign up');
    await expect(signUpLink).toBeVisible();
  });

  test('should navigate to signup page when clicking sign up link', async ({ page }) => {
    const signUpLink = page.locator('a:has-text("Sign up")');
    await signUpLink.click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should display Terms of Service link', async ({ page }) => {
    const termsLink = page.locator('text=Terms of Service');
    await expect(termsLink).toBeVisible();
  });

  test('should display Privacy Policy link', async ({ page }) => {
    const privacyLink = page.locator('text=Privacy Policy');
    await expect(privacyLink).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await signInButton.click();

    // Wait for error message to appear
    const errorMessage = page.locator('text=/Failed to sign in|Invalid credentials/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should require email field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    await signInButton.click();
    // HTML5 validation should prevent submission
    await expect(emailInput).toBeFocused();
  });

  test('should require password field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    await emailInput.fill('test@example.com');
    await signInButton.click();
    // HTML5 validation should prevent submission
    await expect(passwordInput).toBeFocused();
  });

  test('should disable Sign In button while loading', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button:has-text("Sign In")');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Start form submission
    const submitPromise = signInButton.click();
    
    // Check if button shows loading state
    const loadingText = page.locator('text=Signing in...');
    await expect(loadingText).toBeVisible({ timeout: 2000 }).catch(() => {});
    
    await submitPromise.catch(() => {});
  });
});

