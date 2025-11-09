/**
 * Spotify API Client and Utilities
 * 
 * Handles Spotify OAuth and API interactions
 */

import SpotifyWebApi from "spotify-web-api-node";
import { db } from "@/db";
import { spotifyConnections, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Create a Spotify API client with user's access token
 */
export function createSpotifyClient(accessToken: string, refreshToken?: string) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  spotifyApi.setAccessToken(accessToken);
  if (refreshToken) {
    spotifyApi.setRefreshToken(refreshToken);
  }

  return spotifyApi;
}

/**
 * Get user's Spotify connection from database
 */
export async function getUserSpotifyConnection(userId: string) {
  const connection = await db.query.spotifyConnections.findFirst({
    where: eq(spotifyConnections.userId, userId),
  });

  return connection;
}

/**
 * Refresh Spotify access token
 */
export async function refreshSpotifyToken(
  userId: string
): Promise<{ accessToken: string; expiresAt: Date } | null> {
  const connection = await getUserSpotifyConnection(userId);

  if (!connection || !connection.refreshToken) {
    return null;
  }

  const spotifyApi = createSpotifyClient(connection.accessToken, connection.refreshToken);

  try {
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    // Update the connection in database
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    await db
      .update(spotifyConnections)
      .set({
        accessToken: access_token,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(spotifyConnections.userId, userId));

    return {
      accessToken: access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    return null;
  }
}

/**
 * Get Spotify API client for a user (handles token refresh if needed)
 */
export async function getSpotifyClientForUser(userId: string): Promise<SpotifyWebApi | null> {
  const connection = await getUserSpotifyConnection(userId);

  if (!connection) {
    return null;
  }

  // Check if token needs refresh (refresh if expires in less than 5 minutes)
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (connection.expiresAt < fiveMinutesFromNow) {
    const refreshed = await refreshSpotifyToken(userId);
    if (!refreshed) {
      return null;
    }
    return createSpotifyClient(refreshed.accessToken, connection.refreshToken);
  }

  return createSpotifyClient(connection.accessToken, connection.refreshToken);
}

