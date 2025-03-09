import { test, expect } from '@playwright/test';

test.describe('Site navigation and layout', () => {
  test('main layout should have expected elements', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for header with site name
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
  
  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on Tags link
    await page.locator('nav a:has-text("Tags")').click();
    
    // Verify we've navigated to the tags page
    await expect(page.url()).toContain('/tags');
    
    // Go back to home page by clicking Home link
    await page.locator('nav a:has-text("Home")').click();
    
    // Verify we've navigated back to home
    await expect(page.url()).not.toContain('/tags');
  });
});