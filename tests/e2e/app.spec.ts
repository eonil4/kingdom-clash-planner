import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to be fully loaded by waiting for a specific element
    // The FormationGrid is rendered after the app initializes, so it's a good indicator
    await page.waitForSelector('[aria-label="Formation grid"]', { timeout: 30000 });

    // Check that the page title is set
    await expect(page).toHaveTitle(/Kingdom Clash Planner/i);
  });

  test('should display the formation planner', async ({ page }) => {
    await page.goto('/');

    // Wait for the formation grid to be visible, indicating the app has loaded
    const formationGrid = page.locator('[aria-label="Formation grid"]');
    await expect(formationGrid).toBeVisible({ timeout: 30000 });

    // Check that the header is also visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check that the unit list is visible
    const unitList = page.locator('[aria-label="Unit list"]');
    await expect(unitList).toBeVisible();
  });
});

