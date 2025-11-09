# Database Setup Guide

## Quick Start

1. **Start the database:**
   ```bash
   pnpm run db:up
   ```
   This starts a Postgres 16 container using Docker Compose.

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   DATABASE_URL=postgresql://muse:muse_dev_password@localhost:5432/muse
   ```

3. **Run migrations:**
   ```bash
   pnpm run db:push
   ```
   This applies the schema to your database.

## Database Schema

The schema includes:
- **users** - Google OAuth user accounts
- **spotify_connections** - Links users to their Spotify accounts
- **artists** - Artist information from Spotify
- **tracks** - Track information from Spotify
- **listening_history** - Records of what users listened to
- **genres** - Genre information
- **user_genres** - Junction table tracking user genre preferences

## Available Commands

- `pnpm run db:up` - Start the database container
- `pnpm run db:down` - Stop the database container
- `pnpm run db:logs` - View database logs
- `pnpm run db:generate` - Generate a new migration from schema changes
- `pnpm run db:push` - Push schema changes directly to database (dev only)
- `pnpm run db:migrate` - Run migrations
- `pnpm run db:studio` - Open Drizzle Studio (database GUI)

## Data Retention

The database is configured to retain listening history for 30 days. A cleanup function is available in `lib/db-helpers.ts` that should be run periodically.

## Production

For production, you'll want to:
1. Use a managed Postgres service (RDS on AWS)
2. Set up proper connection pooling
3. Configure backups
4. Set up monitoring

See Phase 12 in `plan.md` for AWS deployment details.

