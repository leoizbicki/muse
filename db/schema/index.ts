/**
 * Database schema for Muse - Music Listening Tracker
 * 
 * Schema includes:
 * - Users (Google OAuth)
 * - Spotify connections
 * - Listening history
 * - Artists, Tracks, Genres
 */

import { pgTable, text, timestamp, integer, boolean, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table - Google OAuth authentication
// Compatible with NextAuth.js - email is required, name and image are optional
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // UUID or custom ID
    email: text("email").notNull().unique(),
    name: text("name"),
    emailVerified: timestamp("email_verified"), // For NextAuth compatibility
    image: text("image"), // For NextAuth compatibility (avatar_url)
    googleId: text("google_id").unique(), // Optional - set when user signs in with Google
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    googleIdIdx: index("users_google_id_idx").on(table.googleId),
  })
);

// NextAuth.js tables - required for authentication
// Accounts table - stores OAuth provider accounts
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "oauth" | "email" | "credentials"
    provider: text("provider").notNull(), // "google" | "spotify" | etc.
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    // Unique constraint: one account per provider + providerAccountId combination
    // This prevents duplicate OAuth accounts and helps with account linking
    providerAccountUnique: unique("accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

// Sessions table - stores user sessions
// Note: sessionToken must be the primary key for NextAuth compatibility
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// Verification tokens - for email verification, password reset, etc.
// Note: composite primary key (identifier + token) for NextAuth compatibility
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    // Composite primary key
    pk: unique("verification_tokens_pk").on(table.identifier, table.token),
  })
);

// Spotify connections - links users to their Spotify accounts
export const spotifyConnections = pgTable(
  "spotify_connections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spotifyUserId: text("spotify_user_id").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    connectedAt: timestamp("connected_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("spotify_connections_user_id_idx").on(table.userId),
    spotifyUserIdIdx: index("spotify_connections_spotify_user_id_idx").on(
      table.spotifyUserId
    ),
    userIdUnique: unique("spotify_connections_user_id_unique").on(table.userId),
  })
);

// Artists table - stores artist information
export const artists = pgTable(
  "artists",
  {
    id: text("id").primaryKey(), // UUID
    spotifyArtistId: text("spotify_artist_id").notNull().unique(),
    name: text("name").notNull(),
    genres: jsonb("genres").$type<string[]>().default([]), // Array of genre strings
    popularity: integer("popularity"), // 0-100
    imageUrl: text("image_url"),
    spotifyUrl: text("spotify_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    spotifyArtistIdIdx: index("artists_spotify_artist_id_idx").on(
      table.spotifyArtistId
    ),
    nameIdx: index("artists_name_idx").on(table.name),
  })
);

// Tracks table - stores track information
export const tracks = pgTable(
  "tracks",
  {
    id: text("id").primaryKey(), // UUID
    spotifyTrackId: text("spotify_track_id").notNull().unique(),
    name: text("name").notNull(),
    artistId: text("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    albumName: text("album_name"),
    durationMs: integer("duration_ms").notNull(),
    popularity: integer("popularity"), // 0-100
    previewUrl: text("preview_url"),
    spotifyUrl: text("spotify_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    spotifyTrackIdIdx: index("tracks_spotify_track_id_idx").on(
      table.spotifyTrackId
    ),
    artistIdIdx: index("tracks_artist_id_idx").on(table.artistId),
    nameIdx: index("tracks_name_idx").on(table.name),
  })
);

// Listening history - tracks what users listened to
export const listeningHistory = pgTable(
  "listening_history",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at").notNull(), // When the track was played (from Spotify)
    durationMs: integer("duration_ms"), // How long they actually listened (if available)
    createdAt: timestamp("created_at").notNull().defaultNow(), // When we recorded it
  },
  (table) => ({
    userIdIdx: index("listening_history_user_id_idx").on(table.userId),
    trackIdIdx: index("listening_history_track_id_idx").on(table.trackId),
    playedAtIdx: index("listening_history_played_at_idx").on(table.playedAt),
    // Composite index for common queries (user + time range)
    userPlayedAtIdx: index("listening_history_user_played_at_idx").on(
      table.userId,
      table.playedAt
    ),
  })
);

// Genres table - stores genre information
export const genres = pgTable(
  "genres",
  {
    id: text("id").primaryKey(), // UUID
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("genres_name_idx").on(table.name),
  })
);

// User genres junction table - tracks which genres users listen to
// This helps with recommendations and stats
export const userGenres = pgTable(
  "user_genres",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    genreId: text("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    playCount: integer("play_count").notNull().default(0), // How many times user listened to this genre
    lastPlayedAt: timestamp("last_played_at"), // Last time user listened to this genre
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_genres_user_id_idx").on(table.userId),
    genreIdIdx: index("user_genres_genre_id_idx").on(table.genreId),
    // Unique constraint: one record per user-genre combination
    userGenreUnique: unique("user_genres_user_genre_unique").on(
      table.userId,
      table.genreId
    ),
  })
);

// Relations for Drizzle ORM
export const usersRelations = relations(users, ({ one, many }) => ({
  spotifyConnection: one(spotifyConnections, {
    fields: [users.id],
    references: [spotifyConnections.userId],
  }),
  listeningHistory: many(listeningHistory),
  userGenres: many(userGenres),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const spotifyConnectionsRelations = relations(
  spotifyConnections,
  ({ one }) => ({
    user: one(users, {
      fields: [spotifyConnections.userId],
      references: [users.id],
    }),
  })
);

export const artistsRelations = relations(artists, ({ many }) => ({
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  artist: one(artists, {
    fields: [tracks.artistId],
    references: [artists.id],
  }),
  listeningHistory: many(listeningHistory),
}));

export const listeningHistoryRelations = relations(
  listeningHistory,
  ({ one }) => ({
    user: one(users, {
      fields: [listeningHistory.userId],
      references: [users.id],
    }),
    track: one(tracks, {
      fields: [listeningHistory.trackId],
      references: [tracks.id],
    }),
  })
);

export const genresRelations = relations(genres, ({ many }) => ({
  userGenres: many(userGenres),
}));

export const userGenresRelations = relations(userGenres, ({ one }) => ({
  user: one(users, {
    fields: [userGenres.userId],
    references: [users.id],
  }),
  genre: one(genres, {
    fields: [userGenres.genreId],
    references: [genres.id],
  }),
}));

