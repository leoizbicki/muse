# Google OAuth Setup - Step-by-Step Walkthrough

## Overview
This guide will walk you through setting up Google OAuth credentials and configuring your `.env.local` file.

---

## Part 1: Get Google OAuth Credentials

### Step 1: Go to Google Cloud Console
1. Open your web browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account

### Step 2: Create or Select a Project
1. At the top of the page, click the project dropdown (it might say "Select a project" or show a project name)
2. Click **"New Project"** (or select an existing project if you have one)
3. If creating new:
   - Project name: `Muse` (or any name you like)
   - Click **"Create"**
   - Wait a few seconds for it to be created
4. Make sure your new project is selected in the dropdown

### Step 3: Configure OAuth Consent Screen
1. In the left sidebar, click **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Muse` (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the "Scopes" page:
   - Click **"Add or Remove Scopes"**
   - Check these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**
7. On the "Test users" page (if in testing mode):
   - Click **"Add Users"**
   - Add your email address
   - Click **"Add"**
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials
1. In the left sidebar, click **"APIs & Services"** > **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. If prompted about the consent screen, click **"Configure Consent Screen"** and complete it (see Step 3 above)
5. In the "Create OAuth client ID" form:
   - **Application type**: Select **"Web application"**
   - **Name**: `Muse Development` (or any name)
   - **Authorized JavaScript origins**: Click **"+ ADD URI"** and add:
     ```
     https://localhost:3000
     ```
   - **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
     ```
     https://localhost:3000/api/auth/callback/google
     ```
6. Click **"CREATE"**
7. A popup will appear with your credentials:
   - **Your Client ID**: Copy this (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Your Client Secret**: Copy this (looks like: `GOCSPX-abcdefghijklmnop`)
8. **Important**: Copy both values now - you won't be able to see the secret again!
9. Click **"OK"**

---

## Part 2: Configure Your Local Environment

### Step 1: Find Your Project Directory
Your project is located at:
```
/Users/leo/git/muse
```

The `.env.local` file should be in this directory (same level as `package.json`).

### Step 2: Open or Create `.env.local`
1. Open your code editor (VS Code, Cursor, etc.)
2. Navigate to `/Users/leo/git/muse`
3. Look for a file named `.env.local`
   - If it exists, open it
   - If it doesn't exist, create a new file named `.env.local` (make sure it starts with a dot)

### Step 3: Add Your Credentials
Add these lines to your `.env.local` file (replace the placeholder values with your actual credentials):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=+Vsb+zOd942vRhf6MudvOQCcz3valQWVHJevLDmD8n8=
```

**Replace:**
- `your_client_id_here` with the **Client ID** you copied from Google Cloud Console
- `your_client_secret_here` with the **Client Secret** you copied from Google Cloud Console
- The `NEXTAUTH_SECRET` is already generated for you (you can keep it or generate a new one)

### Step 4: Verify Your File
Your `.env.local` file should look something like this (with your actual values):

```env
# Database (already set up)
DATABASE_URL=postgresql://muse:muse_dev_password@localhost:5432/muse

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456

# NextAuth Configuration
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=+Vsb+zOd942vRhf6MudvOQCcz3valQWVHJevLDmD8n8=
```

---

## Part 3: Update Database Schema

Before testing, you need to update the database with the new NextAuth tables:

```bash
cd /Users/leo/git/muse
pnpm run db:push
```

When prompted about `email_verified` column, choose:
- **"+ email_verified"** (create column)

---

## Part 4: Test It!

1. Make sure your database is running:
   ```bash
   pnpm run db:up
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

3. Open your browser and go to: **https://localhost:3000**

4. You should see the home page. Click **"Sign In to Get Started"** or navigate to **https://localhost:3000/auth/signin**

5. Click **"Sign in with Google"**

6. You'll be redirected to Google's sign-in page. Sign in with your Google account.

7. You'll be asked to grant permissions. Click **"Allow"**.

8. You should be redirected back to your app, now signed in!

---

## Troubleshooting

### "Invalid client" error
- Double-check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure there are no extra spaces or quotes in your `.env.local` file

### "Redirect URI mismatch" error
- Go back to Google Cloud Console
- Make sure the redirect URI is exactly: `https://localhost:3000/api/auth/callback/google`
- Make sure there are no trailing slashes

### "Access blocked" error
- If you're in testing mode, make sure your email is added as a test user in the OAuth consent screen
- Go to "APIs & Services" > "OAuth consent screen" > "Test users" and add your email

### Can't find `.env.local`
- Make sure you're in the `/Users/leo/git/muse` directory
- The file might be hidden (starts with a dot). In your editor, you might need to enable "Show hidden files"
- You can create it if it doesn't exist

---

## Quick Reference

**Project Directory:**
```
/Users/leo/git/muse
```

**Environment File Location:**
```
/Users/leo/git/muse/.env.local
```

**Google Cloud Console:**
```
https://console.cloud.google.com/
```

**Your App URL:**
```
https://localhost:3000
```

**Redirect URI (for Google OAuth):**
```
https://localhost:3000/api/auth/callback/google
```

