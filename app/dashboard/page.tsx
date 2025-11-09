/**
 * Dashboard Page
 * 
 * Displays user's listening statistics and insights
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getTotalListeningTime,
  getTopArtistsByPlayCount,
  getTopTracksByPlayCount,
  getTopGenres,
} from "@/lib/stats";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch stats directly using server-side functions
  let stats = null;
  let error = null;

  try {
    const [totalListeningTime, topArtists, topTracks, topGenres] = await Promise.all([
      getTotalListeningTime(session.user.id),
      getTopArtistsByPlayCount(session.user.id, 10),
      getTopTracksByPlayCount(session.user.id, 10),
      getTopGenres(session.user.id, 10),
    ]);

    stats = {
      success: true,
      period: "all",
      stats: {
        totalListeningTimeMs: totalListeningTime,
        totalListeningTimeHours: Math.round((totalListeningTime / (1000 * 60 * 60)) * 100) / 100,
        topArtists,
        topTracks,
        topGenres,
      },
    };
  } catch (err) {
    console.error("Error fetching stats:", err);
    error = "Error loading stats";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Your Listening Dashboard
          </h1>
          <p className="text-lg text-purple-700">
            Welcome back, <span className="font-semibold">{session.user.name || session.user.email}</span>!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {stats?.success ? (
          <div className="space-y-8">
            {/* Total Listening Time */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition-shadow duration-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">⏱️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    Total Listening Time
                  </h2>
                  <p className="text-purple-600 text-sm">
                    {stats.period === "all" ? "All time" : `Last ${stats.period}`}
                  </p>
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {stats.stats.totalListeningTimeHours.toFixed(1)} hours
              </div>
            </div>

            {/* Top Artists */}
            {stats.stats.topArtists.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    Top Artists
                  </h2>
                </div>
                <div className="space-y-3">
                  {stats.stats.topArtists.map((artist: any, index: number) => (
                    <div
                      key={artist.artistId}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200/50 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {index + 1}
                        </div>
                        {artist.imageUrl ? (
                          <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-purple-900 text-lg">
                            {artist.name}
                          </div>
                          <div className="text-sm text-purple-600">
                            {artist.playCount} {artist.playCount === 1 ? 'play' : 'plays'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Tracks */}
            {stats.stats.topTracks.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    Top Tracks
                  </h2>
                </div>
                <div className="space-y-3">
                  {stats.stats.topTracks.map((track: any, index: number) => (
                    <div
                      key={track.trackId}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200/50 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-purple-900 text-lg">
                            {track.name}
                          </div>
                          <div className="text-sm text-purple-600">
                            {track.artist} • {track.playCount} {track.playCount === 1 ? 'play' : 'plays'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Genres */}
            {stats.stats.topGenres.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎭</span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-900">
                    Top Genres
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {stats.stats.topGenres.map((genre: any) => (
                    <span
                      key={genre.genre}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      {genre.genre} <span className="opacity-90">({genre.playCount})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-purple-100 text-center">
            <div className="text-6xl mb-4">🎧</div>
            <p className="text-purple-800 text-lg font-medium mb-2">
              No listening data yet
            </p>
            <p className="text-purple-600">
              Start listening to music on Spotify and we'll track your stats!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
