import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Ideas/);
    
    // Verify cards are present
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    await expect(cardCount).toBeGreaterThan(0);
  });
});