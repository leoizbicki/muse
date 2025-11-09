# Google OAuth Setup - Google Workspace Account

If you don't see an "External" option, you likely have a Google Workspace account. Here's how to proceed:

## Option 1: Use Your Personal Google Account (Recommended for Development)

If you have a personal Gmail account (not a workspace account), use that instead:

1. Sign out of your Google Workspace account
2. Sign in with your personal Gmail account
3. Go to https://console.cloud.google.com/
4. Create a new project
5. You should now see the "External" option

## Option 2: Use Google Workspace Account (If You Must)

If you need to use your Google Workspace account, the process is slightly different:

### Step 1: OAuth Consent Screen
1. You'll see **"Internal"** as the only option (or it might be pre-selected)
2. Choose **"Internal"** - this means only users in your Google Workspace can use the app
3. Fill in:
   - **App name**: `Muse`
   - **User support email**: Your workspace email
   - **Developer contact**: Your workspace email
4. Click **"Save and Continue"**
5. On "Scopes" page:
   - Click **"Add or Remove Scopes"**
   - Add: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Click **"Update"** > **"Save and Continue"**
6. Skip the "Test users" page (not needed for internal apps)
7. Click **"Back to Dashboard"**

### Step 2: Create OAuth Credentials
1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Select **"Web application"**
4. Name: `Muse Development`
5. **Authorized JavaScript origins**: `http://localhost:3000`
6. **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Click **"CREATE"**
8. Copy your Client ID and Client Secret

### Important Notes for Workspace Accounts:
- **Internal apps** can only be used by users in your Google Workspace organization
- If you want to test with a personal Gmail account, you'll need to use Option 1 (personal account)
- For production/public apps, you may need to request verification from Google

## Option 3: Request External App Access (For Production)

If you need an external app for production:
1. Contact your Google Workspace administrator
2. They may need to enable "External app access" in the admin console
3. Or you may need to submit your app for Google verification

## Recommendation

For development and testing, **Option 1 (personal Gmail account) is easiest** because:
- No restrictions on who can sign in
- Easier to test
- No admin approval needed
- Can switch to workspace later for production if needed

