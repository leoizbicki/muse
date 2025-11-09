/**
 * Sign In Page
 * 
 * Allows users to sign in with Google OAuth
 */

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl = "/", error } = await searchParams;

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-md w-full border border-purple-100">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <span className="text-4xl">🎵</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
            Welcome to Muse
          </h1>
          <p className="text-purple-700 text-lg">
            Sign in to track your music listening habits
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-800 font-medium">
            {error === "OAuthSignin" && "Error signing in. Please try again."}
            {error === "OAuthCallback" &&
              "Error during OAuth callback. Please try again."}
            {error === "OAuthCreateAccount" &&
              "Could not create account. Please try again."}
            {error === "EmailCreateAccount" &&
              "Could not create account with email."}
            {error === "Callback" && "Error in callback. Please try again."}
            {error === "OAuthAccountNotLinked" &&
              "Account already exists with a different provider."}
            {error === "EmailSignin" && "Check your email for a sign-in link."}
            {error === "CredentialsSignin" &&
              "Invalid credentials. Please check your email and password."}
            {error === "SessionRequired" &&
              "Please sign in to access this page."}
            {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin", "SessionRequired"].includes(
              error
            ) && "An error occurred. Please try again."}
          </div>
        )}

        <form action={handleSignIn}>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

