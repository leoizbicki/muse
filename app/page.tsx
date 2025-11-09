import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-transparent to-purple-600/20"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="text-6xl md:text-8xl">🎵</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent leading-tight">
              Welcome to Muse
            </h1>
            <p className="text-xl md:text-2xl text-purple-700 mb-8 font-light">
              Discover your music listening habits and unlock insights about your favorite tracks, artists, and genres.
            </p>

            {session?.user ? (
              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100">
                  <p className="text-purple-800 text-lg mb-6">
                    Welcome back, <span className="font-semibold">{session.user.name || session.user.email}</span>!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/dashboard"
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                    >
                      View Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-4 px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-lg"
                    >
                      Profile Settings
                    </Link>
                  </div>
                </div>
                <div className="bg-purple-100/50 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                  <p className="text-purple-700 text-sm flex items-center justify-center gap-2">
                    <span className="text-lg">💡</span>
                    Don't forget to connect your Spotify account in your profile to start tracking your music!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Link
                  href="/auth/signin"
                  className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-10 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  Get Started
                </Link>
                <p className="text-purple-600 text-sm">
                  Sign in with Google to begin your musical journey
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      {!session?.user && (
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Track Your Stats</h3>
              <p className="text-purple-700">
                See your total listening time, top artists, and favorite tracks all in one place.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Spotify Integration</h3>
              <p className="text-purple-700">
                Connect your Spotify account to automatically sync your listening history.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Discover Insights</h3>
              <p className="text-purple-700">
                Uncover patterns in your music taste and explore your listening habits.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


