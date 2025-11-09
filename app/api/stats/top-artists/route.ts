/**
 * Top Artists API Endpoint
 * 
 * Returns top artists by play count or listening time
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTopArtistsByPlayCount, getTopArtistsByTime } from "@/lib/stats";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "plays"; // "plays" or "time"
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const period = searchParams.get("period") || "all";

    // Calculate date range
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
        startDate = undefined;
    }

    const artists =
      sortBy === "time"
        ? await getTopArtistsByTime(session.user.id, limit, startDate, endDate)
        : await getTopArtistsByPlayCount(session.user.id, limit, startDate, endDate);

    return NextResponse.json({
      success: true,
      sortBy,
      period,
      artists,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error getting top artists:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

