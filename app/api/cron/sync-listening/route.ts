/**
 * Vercel Cron Job Endpoint
 * 
 * Syncs listening history for all users with Spotify connections
 * This endpoint is called by Vercel Cron Jobs every 5 minutes
 * 
 * To set up in Vercel:
 * 1. Go to your project settings
 * 2. Navigate to "Cron Jobs"
 * 3. Add a new cron job:
 *    - Path: /api/cron/sync-listening
 *    - Schedule: every 5 minutes (configured in vercel.json)
 *    - Timezone: UTC
 */

import { NextResponse } from "next/server";
import { syncAllUsersListeningData } from "@/lib/spotify-data";
import { cleanupOldListeningHistory } from "@/lib/db-helpers";

// Verify the request is from Vercel Cron
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  // In production, Vercel will set a CRON_SECRET env var
  // For local testing, you can skip this check or set CRON_SECRET
  if (process.env.NODE_ENV === "production" && !verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔄 Starting listening data sync for all users...");

    // Sync listening data for all users
    const syncResult = await syncAllUsersListeningData();

    // Clean up old listening history (older than 30 days)
    console.log("🧹 Cleaning up old listening history...");
    await cleanupOldListeningHistory();

    console.log("✅ Sync complete:", {
      usersProcessed: syncResult.usersProcessed,
      totalTracksStored: syncResult.totalTracksStored,
      errors: syncResult.errors.length,
    });

    return NextResponse.json({
      success: true,
      usersProcessed: syncResult.usersProcessed,
      totalTracksStored: syncResult.totalTracksStored,
      errors: syncResult.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error in cron job:", error);
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

