# muse

Let's build a web app to track music listening and report stats on top artists and songs. Users should be able to connect their spotify account to it, and see a dashboard of stats like time listened, favorite songs, genres, and recommended artists.

Help me think through how to break this into iterative pieces and write a plan.md

Requirements:

- Google Oauth to log in, no user/password - ensure DB schema handles this
- Allow user to connect to their spotify account, where they'll be listening to music
- Use the Spotify API to get back information about music usage to store in DB
- Add unit tests for business logic, e2e tests for core user journies
- use git and pnpm, use descriptive comments

Design:

- Minimal, functional, practical
- intentional use of color
- lets use purple and lavendar tones
- Inspire the design to feel similar to other modern social apps

Frontend:

- Next.js and React
- Tailwind CSS v4
- shadcn/ui
- ESLint 9

Backend:

- Postgres
- Drizzle ORM

Infra:

- Github (use the muse repo)
- Vercel
- Sentry
- When ready you can deploy this to AWS as EC2 or EKS; whatever you think would be optimal

Check off items in the plan as we accomplish them as a to-do list. If you have open questions that require my input, add those in the plan as well.
