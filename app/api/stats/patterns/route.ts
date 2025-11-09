/**
 * Listening Patterns API Endpoint
 * 
 * Returns listening patterns by time of day and day of week
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getListeningPatternsByTimeOfDay,
  getListeningPatternsByDayOfWeek,
} from "@/lib/stats";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [timeOfDay, dayOfWeek] = await Promise.all([
      getListeningPatternsByTimeOfDay(session.user.id),
      getListeningPatternsByDayOfWeek(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      patterns: {
        timeOfDay,
        dayOfWeek,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error getting listening patterns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

