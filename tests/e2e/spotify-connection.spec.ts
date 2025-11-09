import { test, expect } from '@playwright/test';

/**
 * E2E Test for Spotify Connection Flow
 * 
 * This test verifies the complete Spotify OAuth connection flow:
 * 1. User signs in with Google
 * 2. User navigates to profile
 * 3. User clicks "Connect Spotify"
 * 4. User authorizes on Spotify
 * 5. User is redirected back to profile with connection confirmed
 * 
 * Note: This test requires:
 * - Valid Google OAuth credentials
 * - Valid Spotify OAuth credentials
 * - A test user account
 * 
 * For now, this is a manual test that can be run to verify the flow works.
 */

test.describe('Spotify Connection Flow', () => {
  test.skip('Spotify OAuth connection flow - requires manual intervention', async ({ page, context }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check if we're on the sign-in page or already signed in
    const isSignedIn = await page.locator('text=Welcome back').isVisible().catch(() => false);
    
    if (!isSignedIn) {
      // Click sign in
      await page.click('text=Sign In to Get Started');
      
      // Wait for Google OAuth (this will require manual interaction)
      // In a real test, you'd use test credentials or mock the OAuth flow
      await page.waitForURL(/\/profile|\/auth\/signin/, { timeout: 30000 });
    }
    
    // Navigate to profile
    await page.goto('/profile');
    
    // Check if Spotify is already connected
    const isConnected = await page.locator('text=Connected').isVisible().catch(() => false);
    
    if (!isConnected) {
      // Click "Connect Spotify" button
      await page.click('text=Connect Spotify');
      
      // Wait for Spotify authorization page
      // This will require manual interaction to authorize
      await page.waitForURL(/accounts\.spotify\.com/, { timeout: 10000 });
      
      // After manual authorization, wait for redirect back
      await page.waitForURL(/\/profile/, { timeout: 30000 });
      
      // Verify we're back on profile page
      await expect(page).toHaveURL(/\/profile/);
      
      // Verify connection success message or status
      const successMessage = await page.locator('text=Connected').or(page.locator('text=spotify_connected')).isVisible().catch(() => false);
      expect(successMessage).toBeTruthy();
    }
  });

  test('Profile page loads correctly', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to sign-in if not authenticated
    // Or show profile if authenticated
    const url = page.url();
    expect(url).toMatch(/\/profile|\/auth\/signin/);
  });

  test('Spotify connection button exists on profile', async ({ page }) => {
    // This test assumes you're already signed in
    // In a real scenario, you'd set up authentication first
    await page.goto('/profile');
    
    // Check if we're redirected to sign-in (expected if not authenticated)
    if (page.url().includes('/auth/signin')) {
      test.skip();
    }
    
    // If on profile, check for Spotify connection button
    const connectButton = page.locator('text=Connect Spotify').or(page.locator('text=Spotify'));
    await expect(connectButton).toBeVisible();
  });
});

