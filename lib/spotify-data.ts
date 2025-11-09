/**
 * Spotify Data Collection Service
 * 
 * Handles fetching and storing listening data from Spotify API
 */

import SpotifyWebApi from "spotify-web-api-node";
import { db } from "@/db";
import { artists, tracks, listeningHistory, spotifyConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSpotifyClientForUser } from "./spotify";

/**
 * Store or update an artist in the database
 */
async function upsertArtist(spotifyArtist: SpotifyApi.ArtistObjectFull) {
  // Check if artist already exists
  const existing = await db.query.artists.findFirst({
    where: eq(artists.spotifyArtistId, spotifyArtist.id),
  });

  const artistData = {
    spotifyArtistId: spotifyArtist.id,
    name: spotifyArtist.name,
    genres: spotifyArtist.genres || [],
    popularity: spotifyArtist.popularity,
    imageUrl: spotifyArtist.images?.[0]?.url || null,
    spotifyUrl: spotifyArtist.external_urls?.spotify || null,
    updatedAt: new Date(),
  };

  if (existing) {
    // Update existing artist
    await db
      .update(artists)
      .set(artistData)
      .where(eq(artists.id, existing.id));
    return existing.id;
  } else {
    // Create new artist
    const artistId = nanoid();
    await db.insert(artists).values({
      id: artistId,
      ...artistData,
      createdAt: new Date(),
    });
    return artistId;
  }
}

/**
 * Store or update a track in the database
 */
async function upsertTrack(
  spotifyTrack: SpotifyApi.TrackObjectFull,
  artistId: string
) {
  // Check if track already exists
  const existing = await db.query.tracks.findFirst({
    where: eq(tracks.spotifyTrackId, spotifyTrack.id),
  });

  const trackData = {
    spotifyTrackId: spotifyTrack.id,
    name: spotifyTrack.name,
    artistId,
    albumName: spotifyTrack.album?.name || null,
    durationMs: spotifyTrack.duration_ms,
    popularity: spotifyTrack.popularity,
    previewUrl: spotifyTrack.preview_url || null,
    spotifyUrl: spotifyTrack.external_urls?.spotify || null,
    updatedAt: new Date(),
  };

  if (existing) {
    // Update existing track
    await db
      .update(tracks)
      .set(trackData)
      .where(eq(tracks.id, existing.id));
    return existing.id;
  } else {
    // Create new track
    const trackId = nanoid();
    await db.insert(tracks).values({
      id: trackId,
      ...trackData,
      createdAt: new Date(),
    });
    return trackId;
  }
}

/**
 * Store listening history entry
 */
async function storeListeningHistory(
  userId: string,
  trackId: string,
  playedAt: Date,
  durationMs?: number
) {
  // Check if this exact listening event already exists (prevent duplicates)
  const existing = await db.query.listeningHistory.findFirst({
    where: and(
      eq(listeningHistory.userId, userId),
      eq(listeningHistory.trackId, trackId),
      eq(listeningHistory.playedAt, playedAt)
    ),
  });

  if (existing) {
    // Already stored, skip
    return existing.id;
  }

  // Create new listening history entry
  const historyId = nanoid();
  await db.insert(listeningHistory).values({
    id: historyId,
    userId,
    trackId,
    playedAt,
    durationMs: durationMs || null,
    createdAt: new Date(),
  });

  return historyId;
}

/**
 * Fetch and store recently played tracks for a user
 * Returns the number of new tracks stored
 */
export async function syncRecentlyPlayedTracks(userId: string): Promise<{
  success: boolean;
  tracksStored: number;
  error?: string;
}> {
  try {
    const spotifyApi = await getSpotifyClientForUser(userId);
    if (!spotifyApi) {
      return {
        success: false,
        tracksStored: 0,
        error: "No Spotify connection found or token refresh failed",
      };
    }

    // Get recently played tracks (Spotify returns up to 50)
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });
    const items = response.body.items;

    if (!items || items.length === 0) {
      return { success: true, tracksStored: 0 };
    }

    let tracksStored = 0;

    // Process each track
    for (const item of items) {
      const track = item.track;
      const playedAt = new Date(item.played_at);

      // Store artist first
      const primaryArtist = track.artists[0];
      if (!primaryArtist) continue;

      // Get full artist details
      let artistData: SpotifyApi.ArtistObjectFull;
      try {
        const artistResponse = await spotifyApi.getArtist(primaryArtist.id);
        artistData = artistResponse.body;
      } catch (error) {
        console.error(`Error fetching artist ${primaryArtist.id}:`, error);
        continue;
      }

      const artistId = await upsertArtist(artistData);

      // Get full track details
      let trackData: SpotifyApi.TrackObjectFull;
      try {
        const trackResponse = await spotifyApi.getTrack(track.id);
        trackData = trackResponse.body;
      } catch (error) {
        console.error(`Error fetching track ${track.id}:`, error);
        continue;
      }

      const trackDbId = await upsertTrack(trackData, artistId);

      // Store listening history
      await storeListeningHistory(userId, trackDbId, playedAt, track.duration_ms);

      tracksStored++;
    }

    return { success: true, tracksStored };
  } catch (error: any) {
    console.error("Error syncing recently played tracks:", error);
    return {
      success: false,
      tracksStored: 0,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Fetch and store historical listening data (last 30 days)
 * This is called once when a user first connects Spotify
 */
export async function syncHistoricalListeningData(
  userId: string
): Promise<{
  success: boolean;
  tracksStored: number;
  error?: string;
}> {
  try {
    const spotifyApi = await getSpotifyClientForUser(userId);
    if (!spotifyApi) {
      return {
        success: false,
        tracksStored: 0,
        error: "No Spotify connection found or token refresh failed",
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const afterTimestamp = Math.floor(thirtyDaysAgo.getTime());

    let totalTracksStored = 0;
    let before: number | undefined = undefined;
    let hasMore = true;

    // Spotify's getMyRecentlyPlayedTracks returns up to 50 items per request
    // We need to paginate to get all historical data
    while (hasMore) {
      try {
        const response = await spotifyApi.getMyRecentlyPlayedTracks({
          limit: 50,
          after: afterTimestamp,
          before: before,
        });

        const items = response.body.items;
        if (!items || items.length === 0) {
          hasMore = false;
          break;
        }

        // Process each track (same logic as syncRecentlyPlayedTracks)
        for (const item of items) {
          const track = item.track;
          const playedAt = new Date(item.played_at);

          // Skip if this is older than 30 days
          if (playedAt < thirtyDaysAgo) {
            hasMore = false;
            break;
          }

          const primaryArtist = track.artists[0];
          if (!primaryArtist) continue;

          // Get full artist details
          let artistData: SpotifyApi.ArtistObjectFull;
          try {
            const artistResponse = await spotifyApi.getArtist(primaryArtist.id);
            artistData = artistResponse.body;
          } catch (error) {
            console.error(`Error fetching artist ${primaryArtist.id}:`, error);
            continue;
          }

          const artistId = await upsertArtist(artistData);

          // Get full track details
          let trackData: SpotifyApi.TrackObjectFull;
          try {
            const trackResponse = await spotifyApi.getTrack(track.id);
            trackData = trackResponse.body;
          } catch (error) {
            console.error(`Error fetching track ${track.id}:`, error);
            continue;
          }

          const trackDbId = await upsertTrack(trackData, artistId);

          // Store listening history
          await storeListeningHistory(userId, trackDbId, playedAt, track.duration_ms);

          totalTracksStored++;

          // Update before timestamp for next page (use the oldest item's timestamp)
          before = Math.floor(playedAt.getTime());
        }

        // If we got less than 50 items, we've reached the end
        if (items.length < 50) {
          hasMore = false;
        }

        // Rate limiting: Add a small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        // Handle rate limiting (429 status)
        if (error.statusCode === 429) {
          const retryAfter = error.headers?.["retry-after"] || 1;
          console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          continue; // Retry this page
        }
        throw error;
      }
    }

    return { success: true, tracksStored: totalTracksStored };
  } catch (error: any) {
    console.error("Error syncing historical listening data:", error);
    return {
      success: false,
      tracksStored: 0,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Fetch and store user's top tracks
 * This is used for recommendations
 */
export async function syncTopTracks(
  userId: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<{
  success: boolean;
  tracksStored: number;
  error?: string;
}> {
  try {
    const spotifyApi = await getSpotifyClientForUser(userId);
    if (!spotifyApi) {
      return {
        success: false,
        tracksStored: 0,
        error: "No Spotify connection found or token refresh failed",
      };
    }

    // Get top tracks (Spotify returns up to 50)
    const response = await spotifyApi.getMyTopTracks({
      limit: 50,
      time_range: timeRange,
    });
    const items = response.body.items;

    if (!items || items.length === 0) {
      return { success: true, tracksStored: 0 };
    }

    let tracksStored = 0;

    // Process each track
    for (const track of items) {
      // Store artist first
      const primaryArtist = track.artists[0];
      if (!primaryArtist) continue;

      // Get full artist details
      let artistData: SpotifyApi.ArtistObjectFull;
      try {
        const artistResponse = await spotifyApi.getArtist(primaryArtist.id);
        artistData = artistResponse.body;
      } catch (error) {
        console.error(`Error fetching artist ${primaryArtist.id}:`, error);
        continue;
      }

      const artistId = await upsertArtist(artistData);

      // Track is already full object, no need to fetch again
      const trackDbId = await upsertTrack(track, artistId);
      tracksStored++;
    }

    return { success: true, tracksStored };
  } catch (error: any) {
    console.error("Error syncing top tracks:", error);
    return {
      success: false,
      tracksStored: 0,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Fetch and store user's top artists
 * This is used for recommendations
 */
export async function syncTopArtists(
  userId: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<{
  success: boolean;
  artistsStored: number;
  error?: string;
}> {
  try {
    const spotifyApi = await getSpotifyClientForUser(userId);
    if (!spotifyApi) {
      return {
        success: false,
        artistsStored: 0,
        error: "No Spotify connection found or token refresh failed",
      };
    }

    // Get top artists (Spotify returns up to 50)
    const response = await spotifyApi.getMyTopArtists({
      limit: 50,
      time_range: timeRange,
    });
    const items = response.body.items;

    if (!items || items.length === 0) {
      return { success: true, artistsStored: 0 };
    }

    let artistsStored = 0;

    // Process each artist
    for (const artist of items) {
      await upsertArtist(artist);
      artistsStored++;
    }

    return { success: true, artistsStored };
  } catch (error: any) {
    console.error("Error syncing top artists:", error);
    return {
      success: false,
      artistsStored: 0,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Sync listening data for all users with Spotify connections
 * This is called by the cron job
 */
export async function syncAllUsersListeningData(): Promise<{
  success: boolean;
  usersProcessed: number;
  totalTracksStored: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let usersProcessed = 0;
  let totalTracksStored = 0;

  try {
    // Get all users with Spotify connections
    const connections = await db.query.spotifyConnections.findMany();

    for (const connection of connections) {
      try {
        const result = await syncRecentlyPlayedTracks(connection.userId);
        if (result.success) {
          usersProcessed++;
          totalTracksStored += result.tracksStored;
        } else {
          errors.push(`User ${connection.userId}: ${result.error}`);
        }
      } catch (error: any) {
        errors.push(`User ${connection.userId}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      usersProcessed,
      totalTracksStored,
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      usersProcessed,
      totalTracksStored,
      errors: [error.message || "Unknown error"],
    };
  }
}

