# Vercel Deployment Guide

## Overview
Deploying to Vercel will give us a real domain (e.g., `muse.vercel.app`) which solves the Spotify redirect URI issue permanently.

## Prerequisites
- ✅ Vercel CLI installed
- GitHub repository connected (already done)
- Environment variables ready

## Step 1: Prepare for Deployment

### Note about server.js
The `server.js` file is only for local HTTPS development. Vercel uses Next.js's built-in server with automatic HTTPS, so we don't need it for production.

### Build Configuration
Vercel will automatically detect Next.js and use the `build` script from `package.json`.

## Step 2: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from project directory:**
   ```bash
   cd /Users/leo/git/muse
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? (No, create new)
   - Project name: `muse` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? (No)

3. **After first deployment, get your domain:**
   - Vercel will assign a domain like `muse-xxxxx.vercel.app`
   - You can also use `muse.vercel.app` if available

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```env
# Database (we'll set up Vercel Postgres or external)
DATABASE_URL=your_database_url_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/api/auth/spotify/callback

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
```

## Step 4: Set Up Database

### Option A: Vercel Postgres (Easiest)
1. In Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → "Postgres"
3. Copy the connection string to `DATABASE_URL`
4. Run migrations (we'll need to do this via Vercel CLI or a migration script)

### Option B: External Postgres (RDS, Supabase, etc.)
- Use your existing Postgres connection string
- Make sure it's accessible from Vercel's IP ranges

## Step 5: Update OAuth Redirect URIs

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Edit your OAuth client
4. Add to **Authorized JavaScript origins**: `https://your-domain.vercel.app`
5. Add to **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`
6. Save

### Spotify OAuth
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Edit your app settings
3. Add to **Redirect URIs**: `https://your-domain.vercel.app/api/auth/spotify/callback`
4. Save

## Step 6: Run Database Migrations

After deployment, you'll need to run migrations. Options:

1. **Via Vercel CLI:**
   ```bash
   vercel env pull .env.production
   # Then run migrations locally pointing to production DB (not recommended for production)
   ```

2. **Via Migration Script:**
   - Create a one-time migration endpoint
   - Or use Vercel's Postgres migration feature

3. **Manual SQL:**
   - Connect to your database and run the migration SQL manually

## Step 7: Test Deployment

1. Visit your Vercel domain
2. Test Google OAuth login
3. Test Spotify connection
4. Verify database connections work

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles without errors
- Check Next.js version compatibility

### Environment Variables
- Make sure all required variables are set in Vercel
- Check that secrets are properly configured
- Verify `NEXTAUTH_URL` matches your domain

### Database Connection
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Test connection string locally first

## Next Steps After Deployment

1. ✅ Update OAuth redirect URIs (Google & Spotify)
2. ✅ Run database migrations
3. ✅ Test all OAuth flows
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring and alerts

