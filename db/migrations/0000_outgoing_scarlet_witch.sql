CREATE TABLE "artists" (
	"id" text PRIMARY KEY NOT NULL,
	"spotify_artist_id" text NOT NULL,
	"name" text NOT NULL,
	"genres" jsonb DEFAULT '[]'::jsonb,
	"popularity" integer,
	"image_url" text,
	"spotify_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artists_spotify_artist_id_unique" UNIQUE("spotify_artist_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "listening_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"track_id" text NOT NULL,
	"played_at" timestamp NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spotify_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"spotify_user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spotify_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"spotify_track_id" text NOT NULL,
	"name" text NOT NULL,
	"artist_id" text NOT NULL,
	"album_name" text,
	"duration_ms" integer NOT NULL,
	"popularity" integer,
	"preview_url" text,
	"spotify_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tracks_spotify_track_id_unique" UNIQUE("spotify_track_id")
);
--> statement-breakpoint
CREATE TABLE "user_genres" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"genre_id" text NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"last_played_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_genres_user_genre_unique" UNIQUE("user_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"google_id" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_genres" ADD CONSTRAINT "user_genres_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_genres" ADD CONSTRAINT "user_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artists_spotify_artist_id_idx" ON "artists" USING btree ("spotify_artist_id");--> statement-breakpoint
CREATE INDEX "artists_name_idx" ON "artists" USING btree ("name");--> statement-breakpoint
CREATE INDEX "genres_name_idx" ON "genres" USING btree ("name");--> statement-breakpoint
CREATE INDEX "listening_history_user_id_idx" ON "listening_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listening_history_track_id_idx" ON "listening_history" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "listening_history_played_at_idx" ON "listening_history" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "listening_history_user_played_at_idx" ON "listening_history" USING btree ("user_id","played_at");--> statement-breakpoint
CREATE INDEX "spotify_connections_user_id_idx" ON "spotify_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "spotify_connections_spotify_user_id_idx" ON "spotify_connections" USING btree ("spotify_user_id");--> statement-breakpoint
CREATE INDEX "tracks_spotify_track_id_idx" ON "tracks" USING btree ("spotify_track_id");--> statement-breakpoint
CREATE INDEX "tracks_artist_id_idx" ON "tracks" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "tracks_name_idx" ON "tracks" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_genres_user_id_idx" ON "user_genres" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_genres_genre_id_idx" ON "user_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");