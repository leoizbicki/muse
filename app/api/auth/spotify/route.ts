/**
 * Spotify OAuth Authorization Route
 * 
 * Initiates the Spotify OAuth flow
 */

import { redirect } from "next/navigation";
import SpotifyWebApi from "spotify-web-api-node";
import { auth } from "@/auth";

import { nanoid } from "nanoid";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Create a temporary state token to pass user ID through Spotify OAuth
  // This solves the cookie domain mismatch issue (localhost vs 127.0.0.1)
  const stateToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store state token in database with user ID
  // We'll use the sessions table structure but with a custom token
  try {
    await db.insert(sessions).values({
      sessionToken: `spotify_state_${stateToken}`,
      userId: session.user.id,
      expires: expiresAt,
    });
    console.log("✅ State token stored:", { stateToken, userId: session.user.id });
  } catch (error: any) {
    console.error("❌ Failed to store state token:", error.message);
    // If insertion fails, we can't proceed - redirect to error
    redirect("/profile?error=state_token_failed");
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  // Scopes we need from Spotify
  const scopes = [
    "user-read-recently-played",
    "user-top-read",
    "user-read-email",
    "user-read-private",
  ];

  // Generate authorization URL with state containing user ID
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, stateToken);

  redirect(authorizeURL);
}

