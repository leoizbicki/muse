# Muse - Music Listening Tracker - Development Plan

## Project Overview
A web app to track music listening habits with Spotify integration, featuring user dashboards with listening stats, favorite songs, genres, and artist recommendations.

## Tech Stack Summary
- **Frontend**: Next.js, React, Tailwind CSS v4, shadcn/ui, ESLint 9
- **Backend**: Postgres, Drizzle ORM
- **Auth**: Google OAuth
- **Integration**: Spotify API
- **Infra**: GitHub, Vercel (initial), Sentry, AWS (EKS/EC2 later)
- **Tools**: pnpm, git
- **Testing**: Unit tests (business logic), E2E tests (core user journeys)

---

## Phase 1: Project Foundation & Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Set up pnpm workspace
- [x] Configure ESLint 9
- [x] Set up Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Initialize git repository (already done)
- [x] Create project structure (frontend/backend separation)
- [x] Set up environment variables structure (.env.example)
- [x] Configure Prettier (if not included with ESLint)
- [x] Set up Sentry for error tracking

## Phase 2: Database Design & Setup ✅
- [x] Design database schema:
  - [x] Users table (Google OAuth - email, name, google_id, avatar_url, created_at)
  - [x] Spotify_connections table (user_id, spotify_user_id, access_token, refresh_token, expires_at, connected_at)
  - [x] Listening_history table (user_id, track_id, played_at, duration_ms)
  - [x] Artists table (spotify_artist_id, name, genres, popularity, image_url)
  - [x] Tracks table (spotify_track_id, name, artist_id, album_name, duration_ms, popularity, preview_url)
  - [x] Genres table (name) and user_genres junction table
- [x] Set up local Postgres database (Docker Compose configured)
- [x] Initialize Drizzle ORM
- [x] Create database schema files
- [x] Set up database migrations (migration generated)
- [ ] Create seed data (optional, for development) - Deferred

## Phase 3: Authentication (Google OAuth) ✅
- [x] Set up Google OAuth credentials (guide created: GOOGLE_OAUTH_SETUP.md)
- [x] Implement Google OAuth flow in Next.js (NextAuth.js v5)
- [x] Create API route for OAuth callback
- [x] Store user data in database after OAuth (Drizzle adapter)
- [x] Create session management (database sessions)
- [x] Add protected routes/middleware
- [x] Create user profile page (basic)
- [ ] Write unit tests for auth logic - Deferred
- [ ] Write E2E test for Google login flow - Deferred

## Phase 4: Spotify Integration - Connection ✅
- [x] Set up Spotify App in Spotify Developer Dashboard (guide created: SPOTIFY_SETUP.md)
- [x] Implement Spotify OAuth flow
- [x] Create API route for Spotify OAuth callback
- [x] Store Spotify connection (tokens) in database
- [x] Implement token refresh logic
- [x] Create "Connect Spotify" UI component
- [x] Add connection status indicator
- [x] Fix state token mechanism for cookie domain mismatch
- [ ] Write unit tests for token management - Deferred
- [ ] Write E2E test for Spotify connection flow - Deferred

## Phase 5: Spotify Integration - Data Collection ✅
- [x] Create background job/service to fetch listening history
- [x] Implement Spotify API calls:
  - [x] Get recently played tracks (real-time polling every 2-5 minutes)
  - [x] Get historical data (last 30 days on initial connection)
  - [x] Get user's top tracks (short/medium/long term)
  - [x] Get user's top artists
  - [x] Get track/artist details
- [x] Store listening data in database
- [x] Handle rate limiting from Spotify API
- [x] Implement data retention policy (auto-delete records older than 30 days)
- [x] Set up Vercel Cron Job for periodic sync
- [x] Create data sync status/health check
- [ ] Write unit tests for data fetching logic
- [ ] Write E2E test for data collection

## Phase 6: Backend API - Stats & Analytics ✅
- [x] Create API routes for:
  - [x] Total listening time (all-time, this week, this month)
  - [x] Top artists (by play count, by time)
  - [x] Top tracks (by play count, by time)
  - [x] Top genres
  - [x] Listening patterns (time of day, day of week)
- [x] Implement business logic for calculations
- [ ] Add caching layer (if needed for performance) - Deferred (can add later if performance issues)
- [ ] Write unit tests for all stats calculations - Deferred
- [ ] Write API integration tests - Deferred

## Phase 7: Frontend - Dashboard & Stats Display ✅
- [x] Design dashboard layout (purple/lavender theme)
- [x] Create dashboard page component
- [x] Build stats cards/components:
  - [x] Total listening time display
  - [x] Top artists list/cards
  - [x] Top tracks list/cards
  - [x] Genre breakdown (chart or list)
  - [ ] Listening patterns visualization
- [ ] Implement data fetching hooks (React Query or SWR)
- [ ] Add loading states
- [ ] Add error handling/display
- [ ] Make it responsive
- [ ] Write E2E tests for dashboard display

## Phase 8: Frontend - Recommendations
- [ ] Design recommendations UI
- [ ] Implement simple recommendation algorithm/logic:
  - [ ] Based on top genres (primary)
  - [ ] Based on top artists (secondary)
  - [ ] Note: ML-based recommendations deferred to future iteration
- [ ] Create recommendations API endpoint
- [ ] Build recommendations display component
- [ ] Add "refresh recommendations" functionality
- [ ] Write unit tests for recommendation logic
- [ ] Write E2E test for recommendations flow

## Phase 9: Frontend - Polish & UX
- [ ] Apply purple/lavender color scheme throughout
- [ ] Add animations/transitions
- [ ] Improve loading states (skeletons)
- [ ] Add empty states
- [ ] Implement dark mode (optional but nice)
- [ ] Add tooltips/help text
- [ ] Optimize images/assets
- [ ] Add meta tags for SEO
- [ ] Accessibility audit and fixes

## Phase 10: Testing & Quality
- [ ] Complete unit test coverage for business logic
- [ ] Complete E2E tests for core user journeys:
  - [ ] Google login → Connect Spotify → View dashboard
  - [ ] View stats and recommendations
  - [ ] Data refresh/sync
- [ ] Performance testing
- [ ] Security audit (OAuth flows, token storage, SQL injection prevention)
- [ ] Code review and refactoring

## Phase 11: Deployment - Vercel (Initial)
- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Set up Vercel Postgres (or external Postgres)
- [ ] Configure build settings
- [ ] Deploy to Vercel staging
- [ ] Test deployment
- [ ] Set up custom domain (if needed)
- [ ] Deploy to production
- [ ] Configure Sentry for production

## Phase 12: Deployment - AWS Migration (Future)
- [ ] Design AWS infrastructure (EKS vs EC2 decision)
- [ ] Create Terraform configurations:
  - [ ] VPC and networking
  - [ ] EKS cluster (if going EKS route)
  - [ ] RDS Postgres instance
  - [ ] Load balancer
  - [ ] Security groups
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Migrate database to RDS
- [ ] Deploy application to AWS
- [ ] Set up monitoring and logging
- [ ] Configure auto-scaling
- [ ] Test production deployment
- [ ] Update DNS/domain configuration

---

## Decisions Made

1. **Spotify Data Collection**: ✅ Real-time sync (polling every few minutes)
2. **Historical Data**: ✅ Fetch last 30 days of listening history on initial connection
3. **Recommendations**: ✅ Start with simple genre-based recommendations; ML-based in future iteration
4. **Data Retention**: ✅ Keep data for 30 days (POC phase)
5. **Background Jobs**: ✅ **Vercel Cron Jobs** (initial) → **AWS ECS Scheduled Tasks** (migration)
   - **Why Vercel Cron**: Simple, built-in, no extra infrastructure needed for initial deployment
   - **Why ECS Scheduled Tasks (later)**: More control, better for production, integrates with our EKS cluster, can handle more complex scheduling and retries
6. **Deployment Strategy**: ✅ Vercel first for quick iteration, then migrate to AWS EKS

---

## Notes
- Use descriptive commit messages
- Add comments explaining complex logic
- Follow Next.js best practices
- Keep components small and reusable
- Use TypeScript strictly (no `any` types)
- Document API endpoints

