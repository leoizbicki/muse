import { auth } from "@/auth";
import Link from "next/link";
import { signOut } from "@/auth";

export async function Nav() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Muse
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-purple-700 hover:text-purple-900 font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-purple-700 hover:text-purple-900 font-medium transition-colors duration-200"
                >
                  Profile
                </Link>
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="text-purple-700 hover:text-purple-900 font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

