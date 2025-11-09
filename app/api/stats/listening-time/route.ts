/**
 * Listening Time API Endpoint
 * 
 * Returns total listening time for different periods
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTotalListeningTime } from "@/lib/stats";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    // Get listening time for different periods
    const [allTime, week, month] = await Promise.all([
      getTotalListeningTime(session.user.id),
      getTotalListeningTime(session.user.id, thisWeek, now),
      getTotalListeningTime(session.user.id, thisMonth, now),
    ]);

    const formatTime = (ms: number) => {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      return { hours, minutes, totalMs: ms };
    };

    return NextResponse.json({
      success: true,
      listeningTime: {
        allTime: formatTime(allTime),
        thisWeek: formatTime(week),
        thisMonth: formatTime(month),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error getting listening time:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

