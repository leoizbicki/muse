/**
 * User Profile Page
 * 
 * Displays user information and profile settings
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { user } = session;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-purple-900 mb-6">Profile</h1>

          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
                Account Information
              </h2>
              <div className="space-y-3">
                {user.image && (
                  <div className="flex items-center gap-4">
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                {user.id && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      User ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {user.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t">
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
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

