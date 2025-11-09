import { test, expect } from '@playwright/test';

/**
 * Test Spotify OAuth endpoints
 * 
 * These tests verify that the Spotify OAuth endpoints are accessible
 * and respond correctly (even if they redirect for authentication)
 */

test.describe('Spotify OAuth Endpoints', () => {
  test('Spotify authorization endpoint redirects when not authenticated', async ({ page }) => {
    // Navigate to the Spotify auth endpoint
    const response = await page.goto('/api/auth/spotify', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Should redirect to sign-in if not authenticated
    // Or redirect to Spotify if authenticated
    const url = page.url();
    expect(url).toMatch(/\/auth\/signin|accounts\.spotify\.com/);
  });

  test('Spotify callback endpoint handles missing parameters', async ({ page }) => {
    // Try to access callback without parameters
    const response = await page.goto('/api/auth/spotify/callback', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to sign-in or profile with error
    const url = page.url();
    expect(url).toMatch(/\/auth\/signin|\/profile/);
  });

  test('Spotify callback endpoint handles error parameter', async ({ page }) => {
    // Simulate Spotify returning an error
    const response = await page.goto('/api/auth/spotify/callback?error=access_denied', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to profile with error
    const url = page.url();
    expect(url).toMatch(/\/profile|\/auth\/signin/);
  });
});

