/**
 * Test endpoint for syncing top tracks and artists
 * 
 * This is a temporary endpoint for testing the top tracks/artists sync functionality
 * In production, this would be called as part of the initial connection or periodic sync
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncTopTracks, syncTopArtists } from "@/lib/spotify-data";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔄 Testing top tracks and artists sync for user:", session.user.id);

    // Sync top tracks (medium term - last 6 months)
    const tracksResult = await syncTopTracks(session.user.id, "medium_term");
    console.log("📊 Top tracks sync result:", tracksResult);

    // Sync top artists (medium term - last 6 months)
    const artistsResult = await syncTopArtists(session.user.id, "medium_term");
    console.log("🎤 Top artists sync result:", artistsResult);

    return NextResponse.json({
      success: true,
      topTracks: tracksResult,
      topArtists: artistsResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error in test sync:", error);
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

