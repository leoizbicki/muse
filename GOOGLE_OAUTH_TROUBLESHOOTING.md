# Google OAuth Troubleshooting Guide

## Common Issues After Switching to HTTPS

### Issue 1: "Redirect URI Mismatch" Error

**Symptoms:**
- Error message: "redirect_uri_mismatch"
- Google shows an error page after clicking "Sign in with Google"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check these settings:
   - **Authorized JavaScript origins**: Must include exactly `https://localhost:3000` (no trailing slash)
   - **Authorized redirect URIs**: Must include exactly `https://localhost:3000/api/auth/callback/google` (no trailing slash)
5. Click **"SAVE"**
6. **Important**: Wait 1-2 minutes for changes to propagate
7. Clear your browser cache or try in an incognito window

### Issue 2: Environment Variables Not Loaded

**Symptoms:**
- OAuth still uses old HTTP URLs
- Server needs restart after changing `.env.local`

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Verify `.env.local` has:
   ```env
   NEXTAUTH_URL=https://localhost:3000
   ```
   (No trailing slash, must be HTTPS)
3. Restart the server: `pnpm run dev`
4. Clear browser cache

### Issue 3: Certificate Warning Blocking OAuth

**Symptoms:**
- Browser shows "Not Secure" warning
- OAuth redirects fail

**Solution:**
1. Trust the certificate:
   ```bash
   mkcert -install
   ```
2. Restart your browser
3. Try again

### Issue 4: Multiple Redirect URIs

**Check if you have BOTH http and https:**
- In Google Console, make sure you **remove** the old `http://localhost:3000` entries
- Only keep the `https://localhost:3000` entries

### Issue 5: Exact URL Matching

Google is very strict about URL matching. Make sure:
- ✅ `https://localhost:3000` (correct)
- ❌ `https://localhost:3000/` (trailing slash - wrong)
- ❌ `http://localhost:3000` (HTTP - wrong)
- ❌ `https://127.0.0.1:3000` (different hostname - wrong)

## Verification Steps

1. **Check your Google Console settings:**
   - Authorized JavaScript origins: `https://localhost:3000`
   - Authorized redirect URIs: `https://localhost:3000/api/auth/callback/google`

2. **Check your `.env.local`:**
   ```bash
   cat .env.local | grep NEXTAUTH_URL
   ```
   Should show: `NEXTAUTH_URL=https://localhost:3000`

3. **Test the callback URL:**
   ```bash
   curl -k https://localhost:3000/api/auth/callback/google
   ```
   Should return a response (not 404)

4. **Check what NextAuth is sending:**
   Visit: `https://localhost:3000/api/auth/signin/google`
   Look at the redirect URL in the address bar - it should contain `redirect_uri=https%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle`

## Quick Fix Checklist

- [ ] Removed old HTTP URLs from Google Console
- [ ] Added HTTPS URLs to Google Console (no trailing slashes)
- [ ] Saved changes in Google Console
- [ ] Waited 1-2 minutes for propagation
- [ ] Updated `.env.local` with `NEXTAUTH_URL=https://localhost:3000`
- [ ] Restarted the dev server
- [ ] Cleared browser cache or used incognito
- [ ] Trusted the certificate (`mkcert -install`)

## Still Not Working?

If you're still having issues, check:
1. Browser console for errors
2. Server logs for error messages
3. The exact error message from Google
4. Make sure you're accessing the site via `https://localhost:3000` (not http)

