/**
 * User Profile Page
 * 
 * Displays user information and profile settings
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { getUserSpotifyConnection } from "@/lib/spotify";
import Link from "next/link";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ spotify_connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { user } = session;

  // Check Spotify connection status
  const spotifyConnection = user.id
    ? await getUserSpotifyConnection(user.id)
    : null;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto border border-purple-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>

          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Account Information
              </h2>
              <div className="space-y-4">
                {user.image && (
                  <div className="flex items-center gap-4">
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">
                    Name
                  </label>
                  <p className="text-purple-900 font-medium text-lg">{user.name || "Not set"}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">
                    Email
                  </label>
                  <p className="text-purple-900 font-medium">{user.email}</p>
                </div>
                {user.id && (
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">
                      User ID
                    </label>
                    <p className="text-purple-900 font-mono text-sm break-all">
                      {user.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Spotify Connection */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                Spotify Connection
              </h2>
              {params.spotify_connected === "true" && (
                <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-green-800 font-medium flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  Spotify account connected successfully!
                </div>
              )}
              {params.error && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-800 font-medium flex items-center gap-2">
                  <span className="text-xl">❌</span>
                  Error: {params.error}
                </div>
              )}
              {spotifyConnection ? (
                <div className="bg-white rounded-lg p-5 border border-green-200 space-y-3">
                  <p className="text-purple-900 font-semibold text-lg flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    Spotify connected as: <span className="text-purple-700">{spotifyConnection.spotifyUserId}</span>
                  </p>
                  <p className="text-sm text-purple-600">
                    Connected on: {new Date(spotifyConnection.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-purple-800 font-medium">
                    Connect your Spotify account to start tracking your listening habits.
                  </p>
                  <Link
                    href="/api/auth/spotify"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="text-xl">🎧</span>
                    Connect Spotify
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
              >
                View Dashboard
              </Link>
              <form action={handleSignOut} className="flex-1">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

