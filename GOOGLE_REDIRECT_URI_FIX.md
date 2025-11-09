# Fixing Google OAuth redirect_uri_mismatch Error

## The Problem
You're getting `Error 400: redirect_uri_mismatch` because the redirect URI that NextAuth is sending to Google doesn't exactly match what's configured in your Google Cloud Console.

## The Solution

### Step 1: Verify Your Environment Variable
Your `.env.local` should have:
```env
NEXTAUTH_URL=https://localhost:3000
```
**Important**: No trailing slash, must be HTTPS.

### Step 2: Check What NextAuth is Sending
NextAuth automatically constructs the callback URL as:
```
{NEXTAUTH_URL}/api/auth/callback/google
```

So with `NEXTAUTH_URL=https://localhost:3000`, it sends:
```
https://localhost:3000/api/auth/callback/google
```

### Step 3: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID (the one you're using for Muse)
4. In the **Authorized redirect URIs** section:
   - **Remove ALL existing entries** (including any HTTP ones)
   - Click **"+ ADD URI"**
   - Add exactly: `https://localhost:3000/api/auth/callback/google`
   - **Make sure there's NO trailing slash**
5. In the **Authorized JavaScript origins** section:
   - **Remove ALL existing entries** (including any HTTP ones)
   - Click **"+ ADD URI"**
   - Add exactly: `https://localhost:3000`
   - **Make sure there's NO trailing slash**
6. Click **"SAVE"** at the bottom
7. **Wait 1-2 minutes** for changes to propagate

### Step 4: Common Mistakes to Avoid

❌ **Wrong:**
- `http://localhost:3000/api/auth/callback/google` (HTTP instead of HTTPS)
- `https://localhost:3000/api/auth/callback/google/` (trailing slash)
- `https://127.0.0.1:3000/api/auth/callback/google` (different hostname)
- `https://localhost:3000/callback/google` (wrong path)

✅ **Correct:**
- `https://localhost:3000/api/auth/callback/google` (exact match)

### Step 5: Restart Your Dev Server

After making changes:
1. Stop your dev server (Ctrl+C)
2. Restart it: `pnpm run dev`
3. Clear your browser cache or use an incognito window
4. Try signing in again

### Step 6: Verify the Redirect URI

To see what NextAuth is actually sending, you can:
1. Visit: `https://localhost:3000/api/auth/signin/google`
2. Look at the URL in your browser's address bar after it redirects to Google
3. The `redirect_uri` parameter should be: `https%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle`
   (URL-encoded version of `https://localhost:3000/api/auth/callback/google`)

## Still Not Working?

If you're still getting the error after following these steps:

1. **Double-check for typos** - Google is very strict about exact matches
2. **Check if you have multiple OAuth clients** - Make sure you're editing the correct one
3. **Verify your NEXTAUTH_URL** - Run: `cat .env.local | grep NEXTAUTH_URL`
4. **Wait longer** - Sometimes Google takes 2-3 minutes to propagate changes
5. **Try incognito mode** - Your browser might be caching the old redirect URI

## Quick Checklist

- [ ] `NEXTAUTH_URL=https://localhost:3000` in `.env.local` (no trailing slash)
- [ ] Removed ALL old HTTP redirect URIs from Google Console
- [ ] Added exactly `https://localhost:3000/api/auth/callback/google` (no trailing slash)
- [ ] Added exactly `https://localhost:3000` to JavaScript origins (no trailing slash)
- [ ] Clicked SAVE in Google Console
- [ ] Waited 1-2 minutes
- [ ] Restarted dev server
- [ ] Cleared browser cache or used incognito

