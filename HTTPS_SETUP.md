# HTTPS Setup for Local Development

## Overview
This project uses HTTPS for local development to ensure compatibility with OAuth providers (like Spotify) that require HTTPS redirect URIs.

## Certificate Setup

Certificates have been generated using `mkcert` and are stored in `.certs/`:
- `localhost+2.pem` - Certificate
- `localhost+2-key.pem` - Private key

These certificates are valid for:
- `localhost`
- `127.0.0.1`
- `::1` (IPv6 localhost)

## Trusting the Certificate (Optional but Recommended)

To avoid browser security warnings, install the local CA:

```bash
mkcert -install
```

You'll be prompted for your password. This installs a Certificate Authority that your system will trust.

**Note**: If you skip this step, your browser will show a security warning. You can click "Advanced" and "Proceed to localhost" to continue.

## Running the Development Server

The dev server now runs with HTTPS by default:

```bash
pnpm run dev
```

This will start the server at: **https://localhost:3000**

If you need HTTP (for testing), use:
```bash
pnpm run dev:http
```

## Environment Variables

All URLs should use HTTPS:

```env
NEXT_PUBLIC_APP_URL=https://localhost:3000
NEXTAUTH_URL=https://localhost:3000
SPOTIFY_REDIRECT_URI=https://localhost:3000/api/auth/spotify/callback
```

## OAuth Provider Configuration

### Google OAuth
- **Authorized JavaScript origins**: `https://localhost:3000`
- **Authorized redirect URIs**: `https://localhost:3000/api/auth/callback/google`

### Spotify OAuth
- **Redirect URIs**: `https://localhost:3000/api/auth/spotify/callback`

## Production

For production, use a proper SSL certificate (Let's Encrypt, AWS Certificate Manager, etc.). The HTTPS setup here is only for local development.

