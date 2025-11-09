import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-purple-900 mb-4">
          Welcome to Muse
        </h1>

        {session?.user ? (
          <div className="space-y-4">
            <p className="text-purple-700 text-lg">
              Welcome back, {session.user.name || session.user.email}!
            </p>
            <div className="flex gap-4">
              <Link
                href="/profile"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                View Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-purple-700 text-lg">
              Your music listening tracker is coming soon...
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Sign In to Get Started
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

