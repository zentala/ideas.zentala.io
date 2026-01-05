#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a test file for a specific post
async function generatePostTest(postSlug) {
  const testFilePath = path.join(process.cwd(), 'tests', 'posts', `${postSlug}.spec.js`);
  
  // Make sure the directory exists
  const dir = path.dirname(testFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const testContent = `
import { test, expect } from '@playwright/test';

test.describe('${postSlug} post', () => {
  test('should display post content correctly', async ({ page }) => {
    await page.goto('/posts/${postSlug}');
    
    // Verify post title is visible
    const postTitle = page.locator('h1');
    await expect(postTitle).toBeVisible();
    
    // Verify post content is displayed
    const postContent = page.locator('article');
    await expect(postContent).toBeVisible();
    
    // Verify tags are displayed
    const tags = page.locator('.tags');
    await expect(tags).toBeVisible();
    
    // Verify there are related posts
    const relatedPosts = page.locator('.related-posts');
    await expect(relatedPosts).toBeVisible();
  });
  
  test('clicking on tags should navigate to tag page', async ({ page }) => {
    await page.goto('/posts/${postSlug}');
    
    // Click on the first tag if it exists
    const firstTag = page.locator('.tags a').first();
    
    if (await firstTag.count() > 0) {
      const tagText = await firstTag.textContent();
      await firstTag.click();
      
      // Verify we've navigated to the tag page
      await expect(page.url()).toContain('/tags/');
      
      // Verify the tag page shows relevant content
      const heading = page.locator('h1');
      await expect(heading).toContainText(/Tag:/);
    }
  });
});
`;

  fs.writeFileSync(testFilePath, testContent.trim());
  console.log(`Generated test file: ${testFilePath}`);
}

// If a post slug is provided as an argument, use it
if (process.argv.length > 2) {
  const postSlug = process.argv[2];
  generatePostTest(postSlug);
  rl.close();
} else {
  // Otherwise, ask for the post slug
  rl.question('Enter the post slug to generate tests for: ', (postSlug) => {
    generatePostTest(postSlug);
    rl.close();
  });
}