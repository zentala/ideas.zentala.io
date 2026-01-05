import { test, expect } from '@playwright/test';

test.describe('API endpoints', () => {
  test.skip('related-posts API requires server mode', async ({ request }) => {
    // Astro is in static mode by default, so API endpoints with POST
    // are not available. We're skipping this test for now.
    
    // In a server or hybrid mode deploy, you would test like this:
    /*
    const response = await request.post(`/api/related-posts.json`, {
      data: {
        tags: ['technology'],
        currentPath: '/posts/example',
        limit: 3
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    */
  });
});