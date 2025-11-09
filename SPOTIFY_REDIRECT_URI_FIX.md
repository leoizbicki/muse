# Fixing Spotify "INVALID_CLIENT: Insecure redirect URI" Error

## The Problem
You're getting `INVALID_CLIENT: Insecure redirect URI` because Spotify requires HTTPS redirect URIs, even for localhost. Your Spotify app settings likely have an HTTP redirect URI.

## The Solution

### Step 1: Update Spotify Developer Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click on your app (Muse)
4. Click **"Settings"** (gear icon) or **"Edit Settings"**
5. Scroll down to **"Redirect URIs"**
6. **Remove ALL HTTP entries** (especially `http://localhost:3000/api/auth/spotify/callback`)
7. Click **"+ ADD NEW REDIRECT URI"**
8. Add exactly: `http://127.0.0.1:3000/api/auth/spotify/callback`
   - **Must use 127.0.0.1** (not localhost)
   - **Must be HTTP** (not HTTPS) for loopback addresses
   - **No trailing slash**
   - **Exact path**: `/api/auth/spotify/callback`
9. Click **"ADD"**
10. Scroll down and click **"SAVE"**
11. **Wait 1-2 minutes** for changes to propagate

### Step 2: Verify Your Environment Variable

Your `.env.local` should have:
```env
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback
```

**Important**: 
- Must use `127.0.0.1` (not localhost)
- Must be HTTP (not HTTPS) for loopback addresses
- No trailing slash
- Must match exactly what's in Spotify Dashboard

### Step 3: Common Mistakes to Avoid

❌ **Wrong:**
- `http://localhost:3000/api/auth/spotify/callback` (Spotify doesn't accept localhost)
- `https://localhost:3000/api/auth/spotify/callback` (Spotify doesn't accept localhost)
- `https://127.0.0.1:3000/api/auth/spotify/callback` (HTTPS not needed for loopback)
- `http://127.0.0.1:3000/api/auth/spotify/callback/` (trailing slash)
- `http://127.0.0.1:3000/callback` (wrong path)

✅ **Correct:**
- `http://127.0.0.1:3000/api/auth/spotify/callback` (exact match)

### Step 4: Restart Your Dev Server

After making changes:
1. Stop your dev server (Ctrl+C)
2. Restart it: `pnpm run dev`
3. Clear your browser cache or use an incognito window
4. Try connecting Spotify again

## Quick Checklist

- [ ] Removed ALL HTTP redirect URIs from Spotify Dashboard
- [ ] Added `http://127.0.0.1:3000/api/auth/spotify/callback` to Spotify Dashboard (no trailing slash)
- [ ] Clicked SAVE in Spotify Dashboard
- [ ] Waited 1-2 minutes for propagation
- [ ] Verified `.env.local` has `SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback`
- [ ] Restarted dev server
- [ ] Cleared browser cache or used incognito

## Still Not Working?

If you're still getting the error:

1. **Double-check for typos** - Spotify is very strict about exact matches
2. **Check if you have multiple redirect URIs** - Make sure you removed the HTTP one
3. **Verify your environment variable** - Run: `cat .env.local | grep SPOTIFY_REDIRECT_URI`
4. **Wait longer** - Sometimes Spotify takes 2-3 minutes to propagate changes
5. **Try incognito mode** - Your browser might be caching the old redirect URI

## Note About HTTPS

This project uses HTTPS for local development (via `mkcert`). Make sure:
- Your dev server is running with HTTPS (using `pnpm run dev`)
- You're accessing the app via `https://localhost:3000` (not `http://`)
- The SSL certificates are trusted (run `mkcert -install` if needed)

