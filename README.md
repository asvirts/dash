# Anygym

A simple workout app for everyday exercise: bodyweight, dumbbells, cardio, stretching, or the gym. Log your routines as usual, with sets×reps or just time ("Walk 20 min"). When you're at a hotel, take a photo or a short video of the gym: AI detects the equipment, and your routine is adapted automatically. Each swap keeps the movement pattern and shows a match %. Reps and tempo are scaled when the dumbbells run light.

```
apps/web       Next.js marketing site (/, /privacy) + /api/detect, the AI equipment scan the app calls
apps/mobile    Expo (React Native) iOS app
packages/core  Shared TypeScript: exercise library, adaptation engine, workout parser, data types, storage
supabase/      Database schema (row-level security, one row per routine / gym / session)
```

## Run locally

```bash
npm install
cp apps/web/.env.example apps/web/.env.local       # add ANTHROPIC_API_KEY
npm run site                                        # marketing site + scan API, http://localhost:3000
npm run mobile                                      # Expo dev server, scan QR with Expo Go
npm test                                            # core engine tests
```

Without Supabase env vars, the app runs in **guest mode**: data stays on the device, and AI scanning is open (dev only).

## Set up accounts and sync (Supabase)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`.
3. Copy the project URL and anon key into:
   - `apps/web/.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `apps/mobile/.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Once Supabase is configured, `/api/detect` requires a signed-in user, so anonymous visitors can't run up your AI bill.

## Deploy the site (Vercel)

Import the repo and set **Root Directory** to `apps/web`. Add the env vars above. Then point the mobile app's `EXPO_PUBLIC_API_URL` at the deployed URL.

Before launch, set `APP_STORE_URL` and `CONTACT_EMAIL` in `apps/web/src/app/site.ts`. The privacy page at `/privacy` is the URL to give App Store Connect.

## How adaptation works

`packages/core/src/adapt.ts` scores every exercise the gym supports against the prescribed one:

- the same movement pattern, or a related one as a fallback
- overlap in target muscles
- similar load capacity and implement (free weight vs. machine)
- unilateral vs. bilateral
- whether the heaviest dumbbell can match your usual working weight

When the swap is lighter, reps go up and tempo/effort cues are added so the set stays hard.
