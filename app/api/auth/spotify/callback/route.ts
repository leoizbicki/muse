/**
 * Spotify OAuth Callback Route
 * 
 * Handles the callback from Spotify OAuth and stores the connection
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { spotifyConnections, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import SpotifyWebApi from "spotify-web-api-node";
import { nanoid } from "nanoid";
import { syncHistoricalListeningData } from "@/lib/spotify-data";

export async function GET(request: Request) {
  console.log("🔵 Spotify callback received");
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  console.log("🔵 Callback params:", { code: !!code, error, state });

  // Try to get session first (works if accessed via same domain)
  let session = await auth();
  let userId: string | null = session?.user?.id || null;

  console.log("🔵 Session check:", { 
    hasSession: !!session, 
    userId,
    email: session?.user?.email 
  });

  // If no session (cookie domain mismatch), use state token to get user ID
  if (!userId && state) {
    console.log("🔵 No session cookie - using state token to get user ID");
    console.log("🔵 Looking for state token:", `spotify_state_${state}`);
    try {
      // Use Drizzle's query API to find the state token
      const stateSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, `spotify_state_${state}`))
        .limit(1);

      console.log("🔵 State token query result:", { 
        found: stateSessions.length > 0,
        count: stateSessions.length 
      });

      if (stateSessions.length > 0) {
        const stateSession = stateSessions[0];
        console.log("🔵 State token details:", {
          expires: stateSession.expires,
          now: new Date(),
          isExpired: stateSession.expires <= new Date()
        });

        if (stateSession.expires > new Date()) {
          userId = stateSession.userId;
          console.log("✅ User ID retrieved from state token:", userId);
          
          // Clean up the state token
          await db.delete(sessions).where(eq(sessions.sessionToken, `spotify_state_${state}`));
          console.log("✅ State token cleaned up");
        } else {
          console.error("❌ State token expired");
        }
      } else {
        console.error("❌ State token not found in database");
      }
    } catch (error: any) {
      console.error("❌ Error retrieving state token:", {
        message: error.message,
        stack: error.stack
      });
    }
  } else if (!userId && !state) {
    console.error("❌ No userId and no state parameter provided");
  }

  // Get the base URL for redirects (HTTPS localhost where session exists)
  const baseUrl = process.env.NEXTAUTH_URL || "https://localhost:3000";

  if (!userId) {
    console.error("❌ No user ID found - redirecting to sign in");
    redirect(`${baseUrl}/auth/signin`);
  }

  if (error) {
    console.error("❌ Spotify returned error:", error);
    redirect(`${baseUrl}/profile?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error("❌ No authorization code received");
    redirect(`${baseUrl}/profile?error=no_code`);
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  console.log("🔵 Spotify API configured:", {
    hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
    hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  try {
    console.log("🔵 Exchanging code for token...");
    // Exchange code for access token
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    console.log("✅ Token received:", {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresIn: expires_in,
    });

    // Get user info from Spotify
    spotifyApi.setAccessToken(access_token);
    console.log("🔵 Fetching Spotify user info...");
    const me = await spotifyApi.getMe();
    const spotifyUserId = me.body.id;

    console.log("✅ Spotify user:", {
      spotifyUserId,
      email: me.body.email,
      displayName: me.body.display_name,
    });

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Check if connection already exists
    console.log("🔵 Checking for existing connection...");
    const existing = await db.query.spotifyConnections.findFirst({
      where: eq(spotifyConnections.userId, userId),
    });

    if (existing) {
      console.log("🔵 Updating existing connection...");
      // Update existing connection
      await db
        .update(spotifyConnections)
        .set({
          spotifyUserId,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(spotifyConnections.userId, userId));
      console.log("✅ Connection updated");
    } else {
      console.log("🔵 Creating new connection...");
      // Create new connection
      await db.insert(spotifyConnections).values({
        id: nanoid(),
        userId: userId,
        spotifyUserId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        connectedAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Connection created");
      
      // Trigger initial historical data sync for new connections
      // This runs in the background - don't wait for it
      syncHistoricalListeningData(userId)
        .then((result) => {
          console.log("📊 Historical data sync result:", {
            success: result.success,
            tracksStored: result.tracksStored,
            error: result.error,
          });
        })
        .catch((error) => {
          console.error("❌ Error in background historical sync:", error);
        });
    }

    console.log("✅ Redirecting to profile...");
    // Redirect to HTTPS localhost where the session cookie exists
    // This ensures the user can see their profile after connecting Spotify
    redirect(`${baseUrl}/profile?spotify_connected=true`);
  } catch (error: any) {
    console.error("❌ Error in Spotify callback:", {
      message: error?.message,
      stack: error?.stack,
      body: error?.body,
      statusCode: error?.statusCode,
    });
    redirect(`${baseUrl}/profile?error=${encodeURIComponent(error?.message || "spotify_connection_failed")}`);
  }
}

