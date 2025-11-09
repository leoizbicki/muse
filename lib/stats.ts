/**
 * Statistics and Analytics Calculations
 * 
 * Business logic for calculating listening statistics
 */

import { db } from "@/db";
import { listeningHistory, tracks, artists, users } from "@/db/schema";
import { eq, sql, and, gte, lte, desc, count, sum } from "drizzle-orm";

/**
 * Get total listening time for a user
 */
export async function getTotalListeningTime(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  // Default to all time if no dates provided
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const result = await db
    .select({
      totalMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end)
      )
    );

  return Number(result[0]?.totalMs || 0);
}

/**
 * Get top artists by play count
 */
export async function getTopArtistsByPlayCount(
  userId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const result = await db
    .select({
      artistId: artists.id,
      artistName: artists.name,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
      totalTimeMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
      imageUrl: artists.imageUrl,
      spotifyUrl: artists.spotifyUrl,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end)
      )
    )
    .groupBy(artists.id, artists.name, artists.imageUrl, artists.spotifyUrl)
    .orderBy(desc(sql`COUNT(${listeningHistory.id})`))
    .limit(limit);

  return result.map((row) => ({
    artistId: row.artistId,
    name: row.artistName,
    playCount: Number(row.playCount),
    totalTimeMs: Number(row.totalTimeMs),
    imageUrl: row.imageUrl,
    spotifyUrl: row.spotifyUrl,
  }));
}

/**
 * Get top artists by listening time
 */
export async function getTopArtistsByTime(
  userId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const result = await db
    .select({
      artistId: artists.id,
      artistName: artists.name,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
      totalTimeMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
      imageUrl: artists.imageUrl,
      spotifyUrl: artists.spotifyUrl,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end)
      )
    )
    .groupBy(artists.id, artists.name, artists.imageUrl, artists.spotifyUrl)
    .orderBy(desc(sql`COALESCE(SUM(${tracks.durationMs}), 0)`))
    .limit(limit);

  return result.map((row) => ({
    artistId: row.artistId,
    name: row.artistName,
    playCount: Number(row.playCount),
    totalTimeMs: Number(row.totalTimeMs),
    imageUrl: row.imageUrl,
    spotifyUrl: row.spotifyUrl,
  }));
}

/**
 * Get top tracks by play count
 */
export async function getTopTracksByPlayCount(
  userId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const result = await db
    .select({
      trackId: tracks.id,
      trackName: tracks.name,
      artistName: artists.name,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
      totalTimeMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
      albumName: tracks.albumName,
      previewUrl: tracks.previewUrl,
      spotifyUrl: tracks.spotifyUrl,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end)
      )
    )
    .groupBy(
      tracks.id,
      tracks.name,
      artists.name,
      tracks.albumName,
      tracks.previewUrl,
      tracks.spotifyUrl
    )
    .orderBy(desc(sql`COUNT(${listeningHistory.id})`))
    .limit(limit);

  return result.map((row) => ({
    trackId: row.trackId,
    name: row.trackName,
    artist: row.artistName,
    playCount: Number(row.playCount),
    totalTimeMs: Number(row.totalTimeMs),
    albumName: row.albumName,
    previewUrl: row.previewUrl,
    spotifyUrl: row.spotifyUrl,
  }));
}

/**
 * Get top tracks by listening time
 */
export async function getTopTracksByTime(
  userId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  const result = await db
    .select({
      trackId: tracks.id,
      trackName: tracks.name,
      artistName: artists.name,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
      totalTimeMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
      albumName: tracks.albumName,
      previewUrl: tracks.previewUrl,
      spotifyUrl: tracks.spotifyUrl,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end)
      )
    )
    .groupBy(
      tracks.id,
      tracks.name,
      artists.name,
      tracks.albumName,
      tracks.previewUrl,
      tracks.spotifyUrl
    )
    .orderBy(desc(sql`COALESCE(SUM(${tracks.durationMs}), 0)`))
    .limit(limit);

  return result.map((row) => ({
    trackId: row.trackId,
    name: row.trackName,
    artist: row.artistName,
    playCount: Number(row.playCount),
    totalTimeMs: Number(row.totalTimeMs),
    albumName: row.albumName,
    previewUrl: row.previewUrl,
    spotifyUrl: row.spotifyUrl,
  }));
}

/**
 * Get top genres
 */
export async function getTopGenres(
  userId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(0);
  const end = endDate || new Date();

  // Get genres from artists that the user has listened to
  // Using a raw SQL query for unnest since Drizzle doesn't support it directly
  // We'll use a simpler approach: aggregate genres from all listened artists
  const artistGenres = await db
    .select({
      genres: artists.genres,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
      totalTimeMs: sql<number>`COALESCE(SUM(${tracks.durationMs}), 0)`,
    })
    .from(listeningHistory)
    .innerJoin(tracks, eq(listeningHistory.trackId, tracks.id))
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, start),
        lte(listeningHistory.playedAt, end),
        sql`${artists.genres} IS NOT NULL AND jsonb_array_length(${artists.genres}) > 0`
      )
    )
    .groupBy(artists.id, artists.genres);

  // Aggregate genres across all artists
  const genreMap = new Map<string, { playCount: number; totalTimeMs: number }>();

  for (const row of artistGenres) {
    const genres = row.genres as string[] || [];
    const playCount = Number(row.playCount);
    const totalTimeMs = Number(row.totalTimeMs);

    for (const genre of genres) {
      const existing = genreMap.get(genre) || { playCount: 0, totalTimeMs: 0 };
      genreMap.set(genre, {
        playCount: existing.playCount + playCount,
        totalTimeMs: existing.totalTimeMs + totalTimeMs,
      });
    }
  }

  // Sort by play count and return top N
  return Array.from(genreMap.entries())
    .map(([genre, stats]) => ({
      genre,
      playCount: stats.playCount,
      totalTimeMs: stats.totalTimeMs,
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit);
}

/**
 * Get listening patterns - time of day distribution
 */
export async function getListeningPatternsByTimeOfDay(userId: string) {
  const result = await db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${listeningHistory.playedAt})`,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
    })
    .from(listeningHistory)
    .where(eq(listeningHistory.userId, userId))
    .groupBy(sql`EXTRACT(HOUR FROM ${listeningHistory.playedAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${listeningHistory.playedAt})`);

  // Initialize all 24 hours with 0
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    playCount: 0,
  }));

  // Fill in actual data
  result.forEach((row) => {
    const hour = Number(row.hour);
    const index = hours.findIndex((h) => h.hour === hour);
    if (index !== -1) {
      hours[index].playCount = Number(row.playCount);
    }
  });

  return hours;
}

/**
 * Get listening patterns - day of week distribution
 */
export async function getListeningPatternsByDayOfWeek(userId: string) {
  const result = await db
    .select({
      dayOfWeek: sql<number>`EXTRACT(DOW FROM ${listeningHistory.playedAt})`,
      playCount: sql<number>`COUNT(${listeningHistory.id})`,
    })
    .from(listeningHistory)
    .where(eq(listeningHistory.userId, userId))
    .groupBy(sql`EXTRACT(DOW FROM ${listeningHistory.playedAt})`)
    .orderBy(sql`EXTRACT(DOW FROM ${listeningHistory.playedAt})`);

  // Day names: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Initialize all 7 days with 0
  const days = dayNames.map((name, index) => ({
    day: name,
    dayOfWeek: index,
    playCount: 0,
  }));

  // Fill in actual data
  result.forEach((row) => {
    const dayOfWeek = Number(row.dayOfWeek);
    const index = days.findIndex((d) => d.dayOfWeek === dayOfWeek);
    if (index !== -1) {
      days[index].playCount = Number(row.playCount);
    }
  });

  return days;
}

