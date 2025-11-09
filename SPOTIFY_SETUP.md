# Spotify OAuth Setup Guide

## Step 1: Create Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the form:
   - **App name**: `Muse` (or your preferred name)
   - **App description**: `Music listening tracker`
   - **Website**: `https://localhost:3000` (for development - **must be HTTPS**)
   - **Redirect URI**: `http://127.0.0.1:3000/api/auth/spotify/callback` (**must use 127.0.0.1 with HTTP, not localhost**)
   - **Which APIs/SDKs are you planning to use?**: Select **"Web API"** ✅ (This is correct - we need Web API for reading listening history, top tracks, etc.)
   - Check the agreement box
5. Click **"Save"**

## Step 2: Get Your Credentials

1. After creating the app, you'll see your app dashboard
2. Click **"Settings"** (gear icon) or click on your app name
3. You'll see:
   - **Client ID**: Copy this value
   - **Client Secret**: Click **"View client secret"** and copy it
   - **Redirect URIs**: Make sure `http://127.0.0.1:3000/api/auth/spotify/callback` is listed (**must use 127.0.0.1 with HTTP, not localhost**)

## Step 3: Add to Environment Variables

Add these to your `.env.local` file:

```env
# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback
```

**Important**: Spotify does NOT accept `localhost` in redirect URIs. For local development, you must use `http://127.0.0.1:3000` (loopback IP with HTTP). The server is configured to listen on both HTTP (127.0.0.1) and HTTPS (localhost) to support both Google OAuth (HTTPS) and Spotify OAuth (HTTP loopback).

## Step 4: Required Scopes

The app will request these Spotify scopes:
- `user-read-recently-played` - To read recently played tracks
- `user-top-read` - To read top tracks and artists
- `user-read-email` - To read user email (optional)
- `user-read-private` - To read user profile

These will be requested automatically when users connect their Spotify account.

## Step 5: For Production

When deploying to production:

1. Update your Spotify app settings:
   - Add your production domain to **Redirect URIs**
   - Example: `https://yourdomain.com/api/auth/spotify/callback`

2. Update environment variables:
   - `SPOTIFY_REDIRECT_URI` - Your production callback URL

## Testing

Once configured:
1. Sign in to your app with Google
2. Navigate to your profile or dashboard
3. Click "Connect Spotify"
4. Authorize the app in Spotify
5. You'll be redirected back and your Spotify account will be connected

