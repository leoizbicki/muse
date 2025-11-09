/**
 * Stats Overview API Endpoint
 * 
 * Returns comprehensive listening statistics for the authenticated user
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTotalListeningTime,
  getTopArtistsByPlayCount,
  getTopTracksByPlayCount,
  getTopGenres,
} from "@/lib/stats";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, week, month

    // Calculate date range based on period
    let startDate: Date | undefined;
    const endDate = new Date();

    switch (period) {
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = undefined; // All time
    }

    // Get all stats in parallel
    const [
      totalListeningTime,
      topArtists,
      topTracks,
      topGenres,
    ] = await Promise.all([
      getTotalListeningTime(session.user.id, startDate, endDate),
      getTopArtistsByPlayCount(session.user.id, 10, startDate, endDate),
      getTopTracksByPlayCount(session.user.id, 10, startDate, endDate),
      getTopGenres(session.user.id, 10, startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      period,
      stats: {
        totalListeningTimeMs: totalListeningTime,
        totalListeningTimeHours: Math.round((totalListeningTime / (1000 * 60 * 60)) * 100) / 100,
        topArtists,
        topTracks,
        topGenres,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error getting stats overview:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

