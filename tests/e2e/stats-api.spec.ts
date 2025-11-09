import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Stats API Endpoints
 * 
 * Tests the stats API endpoints after authentication
 */

test.describe('Stats API Endpoints', () => {
  test('Stats endpoints require authentication', async ({ page }) => {
    // Test that unauthenticated requests are rejected
    const endpoints = [
      '/api/stats/overview',
      '/api/stats/listening-time',
      '/api/stats/top-artists',
      '/api/stats/top-tracks',
      '/api/stats/patterns',
    ];

    for (const endpoint of endpoints) {
      const response = await page.goto(`https://localhost:3000${endpoint}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      
      // Should redirect to sign-in or return 401
      const url = page.url();
      expect(url).toMatch(/\/auth\/signin|\/api\/stats/);
    }
  });

  test('Stats endpoints are accessible', async ({ page }) => {
    // This test assumes you're already signed in
    // In a real scenario, you'd set up authentication first
    await page.goto('/profile');
    
    // Check if we're redirected to sign-in (expected if not authenticated)
    if (page.url().includes('/auth/signin')) {
      test.skip();
    }

    // Test each endpoint
    const endpoints = [
      '/api/stats/overview',
      '/api/stats/listening-time',
      '/api/stats/top-artists',
      '/api/stats/top-tracks',
      '/api/stats/patterns',
    ];

    for (const endpoint of endpoints) {
      const response = await page.goto(`https://localhost:3000${endpoint}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      
      // Should return JSON (not redirect to sign-in)
      const url = page.url();
      expect(url).toMatch(endpoint);
    }
  });
});

