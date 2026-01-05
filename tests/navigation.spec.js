import { test, expect } from '@playwright/test';

test.describe('Site navigation and layout', () => {
  test('main layout should have expected elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for header with site name
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for search placeholder
    const searchBox = page.locator('header span:has-text("Search")');
    await expect(searchBox).toBeVisible();
    
    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
  
  test('footer links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on Tags link in footer
    await page.locator('footer a:has-text("Tags")').click();
    
    // Verify we've navigated to the tags page
    await expect(page.url()).toContain('/tags');
    
    // Go back to home page by clicking the logo
    await page.locator('header a:first-child').click();
    
    // Verify we've navigated back to home
    await expect(page.url()).not.toContain('/tags');
    
    // Visit terms page from footer
    await page.goto('/');
    await page.locator('footer a:has-text("Terms")').click();
    await expect(page.url()).toContain('/terms');
  });
});