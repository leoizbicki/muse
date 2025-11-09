/**
 * NextAuth.js (Auth.js v5) Configuration
 * 
 * This file configures authentication with Google OAuth
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && account.providerAccountId && user.email) {
        try {
          // Check if a user with this email already exists
          const existingUsers = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
          const existingUser = existingUsers[0];

          if (existingUser) {
            // Check if account already exists for this provider+accountId
            const existingAccounts = await db
              .select()
              .from(accounts)
              .where(eq(accounts.providerAccountId, account.providerAccountId))
              .limit(1);
            
            if (existingAccounts.length === 0) {
              // User exists but no account - manually create the account link
              // This handles the case where the adapter created the user but failed to create the account
              try {
                // Type assertion needed due to Drizzle type inference limitations
                await db.insert(accounts).values({
                  id: nanoid(),
                  userId: existingUser.id,
                  type: (account.type || "oauth") as string,
                  provider: account.provider as string,
                  providerAccountId: account.providerAccountId as string,
                  refresh_token: account.refresh_token ?? null,
                  access_token: account.access_token ?? null,
                  expires_at: account.expires_at ?? null,
                  token_type: account.token_type ?? null,
                  scope: account.scope ?? null,
                  id_token: account.id_token ?? null,
                  session_state: account.session_state ?? null,
                } as any);
                console.log("✅ Manually linked account to existing user");
              } catch (insertError: any) {
                console.error("❌ Failed to create account:", insertError.message);
                // If it's a unique constraint violation, the account might already exist
                if (insertError.code !== "23505") {
                  throw insertError;
                }
              }
            }
          }
        } catch (error: any) {
          console.error("Error in signIn callback:", error.message);
          // Don't block sign-in - let the adapter handle it
        }
      }
      // Always allow sign-in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects always go to a valid page
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  // Allow account linking for users with the same email
  // This is safe for OAuth-only authentication
  trustHost: true,
});

