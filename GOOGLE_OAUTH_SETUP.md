# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in the required fields (App name, User support email, Developer contact)
     - Add scopes: `email`, `profile`
     - Add test users (your email) if in testing mode
   - Application type: "Web application"
   - Name: "Muse Development" (or your preferred name)
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

5. Copy your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value

## Step 2: Add Credentials to Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here
```

## Step 3: Generate NEXTAUTH_SECRET

You can generate a random secret using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 4: For Production

When deploying to production (Vercel/AWS), you'll need to:

1. Update the OAuth credentials in Google Cloud Console:
   - Add your production domain to "Authorized JavaScript origins"
   - Add `https://yourdomain.com/api/auth/callback/google` to "Authorized redirect URIs"

2. Update environment variables in your hosting platform:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET` (same secret as development)

## Testing

Once configured, you can test the authentication by:
1. Starting the dev server: `pnpm run dev`
2. Navigating to `http://localhost:3000`
3. You'll be redirected to the sign-in page
4. Click "Sign in with Google"
5. Complete the OAuth flow

