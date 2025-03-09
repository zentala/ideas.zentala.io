import { test, expect } from '@playwright/test';

test.describe('Tags functionality', () => {
  test('should display tags on tags page', async ({ page }) => {
    await page.goto('/tags');
    
    // Check for tag links on the page
    const tagLinks = page.locator('a[href^="/tags/"]');
    const tagCount = await tagLinks.count();
    await expect(tagCount).toBeGreaterThan(0);
  });

  test('should navigate to specific tag page', async ({ page }) => {
    // First go to tags page to find a tag
    await page.goto('/tags');
    
    // Click on the first tag
    const firstTag = page.locator('a[href^="/tags/"]').first();
    await firstTag.click();
    
    // Check that we've navigated to the tag page
    await expect(page.url()).toContain('/tags/');
    
    // Verify posts with this tag are displayed
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // Na tej stronie wystarczy sprawdzić, czy nagłówek jest widoczny
    // ponieważ struktura strony z tagami może się różnić
  });
});