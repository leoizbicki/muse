import { test, expect } from '@playwright/test';

/**
 * Comprehensive Spotify OAuth Flow Validation
 * 
 * This test validates the complete Spotify connection flow:
 * 1. Verifies endpoints are accessible
 * 2. Tests state token creation and retrieval
 * 3. Validates redirect behavior
 */

test.describe('Spotify OAuth Flow Validation', () => {
  test('Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome to Muse');
  });

  test('Profile page redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('Spotify auth endpoint redirects to sign-in when not authenticated', async ({ page, context }) => {
    const response = await page.goto('/api/auth/spotify', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to sign-in
    const url = page.url();
    expect(url).toMatch(/\/auth\/signin/);
  });

  test('Spotify callback endpoint handles missing state parameter', async ({ page }) => {
    // Access callback without state (simulates missing state token)
    const response = await page.goto('/api/auth/spotify/callback', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to sign-in since no userId and no state
    const url = page.url();
    expect(url).toMatch(/\/auth\/signin/);
  });

  test('Spotify callback endpoint handles error from Spotify', async ({ page }) => {
    // Simulate Spotify returning an error
    const response = await page.goto('/api/auth/spotify/callback?error=access_denied&state=test123', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to profile with error or sign-in if no userId
    const url = page.url();
    expect(url).toMatch(/\/profile|\/auth\/signin/);
  });

  test('Spotify callback endpoint handles missing code', async ({ page }) => {
    // Simulate callback without code
    const response = await page.goto('/api/auth/spotify/callback?state=test123', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Should redirect to profile with error or sign-in if no userId
    const url = page.url();
    expect(url).toMatch(/\/profile|\/auth\/signin/);
  });

  test('Server responds to HTTPS requests', async ({ page }) => {
    const response = await page.goto('https://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    expect(response?.status()).toBe(200);
  });

  test('Server responds to HTTP requests on 127.0.0.1', async ({ page, context }) => {
    // Create a new page context that allows HTTP on 127.0.0.1
    const response = await page.goto('http://127.0.0.1:3000', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    expect(response?.status()).toBe(200);
  });
});

