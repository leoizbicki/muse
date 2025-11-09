/**
 * Error Page
 * 
 * Displays authentication errors
 */

import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { error } = searchParams;

  const getErrorMessage = (errorType?: string) => {
    switch (errorType) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error signing in with OAuth provider. Please try again.";
      case "OAuthCallback":
        return "Error during OAuth callback. Please try again.";
      case "OAuthCreateAccount":
        return "Could not create account. Please try again.";
      case "EmailCreateAccount":
        return "Could not create account with email.";
      case "Callback":
        return "Error in callback. Please try again.";
      case "OAuthAccountNotLinked":
        return "An account with this email already exists. Please sign in with your existing account.";
      case "EmailSignin":
        return "Check your email for a sign-in link.";
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-purple-700 mb-6">
          {getErrorMessage(error)}
        </p>

        {error === "Configuration" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Configuration Error Details:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check that all environment variables are set correctly</li>
              <li>Verify database connection is working</li>
              <li>Ensure NEXTAUTH_SECRET is set</li>
              <li>Check server logs for more details</li>
            </ul>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/auth/signin"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

