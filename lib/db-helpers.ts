/**
 * Database helper utilities
 * 
 * Includes functions for:
 * - Data retention (30 days)
 * - Common queries
 */

import { db } from "@/db";
import { listeningHistory } from "@/db/schema";
import { lt, eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Clean up listening history older than 30 days
 * This should be run periodically (via cron job)
 */
export async function cleanupOldListeningHistory() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db
    .delete(listeningHistory)
    .where(lt(listeningHistory.playedAt, thirtyDaysAgo));

  return result;
}

/**
 * Get listening history for a user within a date range
 * Note: This is a simplified version. Full implementation with relations
 * will be added when we implement the API routes.
 */
export async function getUserListeningHistory(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return db
    .select()
    .from(listeningHistory)
    .where(
      and(
        eq(listeningHistory.userId, userId),
        gte(listeningHistory.playedAt, startDate),
        lte(listeningHistory.playedAt, endDate)
      )
    )
    .orderBy(desc(listeningHistory.playedAt));
}

