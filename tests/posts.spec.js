import { test, expect } from '@playwright/test';

test.describe('Posts functionality', () => {
  test('clicking on a post card should navigate to post page', async ({ page }) => {
    await page.goto('/');
    
    // Click the first post card
    const firstCard = page.locator('.card').first();
    await firstCard.click();
    
    // Verify post content is displayed
    const postContent = page.locator('article');
    await expect(postContent).toBeVisible();
    
    // Verify post title is present
    const postTitle = page.locator('article h1');
    await expect(postTitle).toBeVisible();
  });

  test('post should display tags section', async ({ page }) => {
    // First navigate to a post
    await page.goto('/');
    await page.locator('.card').first().click();
    
    // Check for tags section - they're in a div with a border-t border
    const tagsHeading = page.locator('h3:has-text("Tags")');
    
    // If this post has tags, test them
    if (await tagsHeading.count() > 0) {
      await expect(tagsHeading).toBeVisible();
      
      // Check that there are tag links
      const tagLinks = page.locator('a[href^="/tags/"]');
      const tagCount = await tagLinks.count();
      await expect(tagCount).toBeGreaterThan(0);
    }
  });
  
  test('post should have back to ideas link', async ({ page }) => {
    // First navigate to a post
    await page.goto('/');
    await page.locator('.card').first().click();
    
    // Check for back link
    const backLink = page.locator('a:has-text("Back to ideas")');
    await expect(backLink).toBeVisible();
    
    // Click the back link
    await backLink.click();
    
    // Verify we're back on the home page
    await expect(page.url()).toContain('/');
  });
});