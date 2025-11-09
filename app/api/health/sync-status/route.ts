/**
 * Data Sync Status/Health Check Endpoint
 * 
 * Returns the sync status for all users with Spotify connections
 * Useful for monitoring and debugging
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { spotifyConnections, listeningHistory, users } from "@/db/schema";
import { eq, gte, sql, desc, and } from "drizzle-orm";

export async function GET() {
  try {
    // Get all users with Spotify connections
    const connections = await db.query.spotifyConnections.findMany();

    const status = await Promise.all(
      connections.map(async (connection) => {
        // Get user info
        const user = await db.query.users.findFirst({
          where: eq(users.id, connection.userId),
        });

        // Get listening history stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalPlaysResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(listeningHistory)
          .where(eq(listeningHistory.userId, connection.userId));

        const recentPlaysResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(listeningHistory)
          .where(
            and(
              eq(listeningHistory.userId, connection.userId),
              gte(listeningHistory.playedAt, thirtyDaysAgo)
            )
          );

        // Get most recent play
        const mostRecent = await db.query.listeningHistory.findFirst({
          where: eq(listeningHistory.userId, connection.userId),
          orderBy: [desc(listeningHistory.playedAt)],
        });

        // Check if token is expired or expiring soon
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        const tokenStatus =
          connection.expiresAt < now
            ? "expired"
            : connection.expiresAt < fiveMinutesFromNow
            ? "expiring_soon"
            : "valid";

        return {
          userId: connection.userId,
          userEmail: user?.email || "unknown",
          spotifyUserId: connection.spotifyUserId,
          connectedAt: connection.connectedAt,
          lastUpdated: connection.updatedAt,
          tokenStatus,
          tokenExpiresAt: connection.expiresAt,
          stats: {
            totalPlays: Number(totalPlaysResult[0]?.count || 0),
            recentPlays: Number(recentPlaysResult[0]?.count || 0),
            mostRecentPlay: mostRecent?.playedAt || null,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalConnections: connections.length,
      connections: status,
    });
  } catch (error: any) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

