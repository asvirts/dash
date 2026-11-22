# Anygym: iOS app (Expo)

Everyday workout logger that adapts your routine to whatever gym you're in. It shares
`@anygym/core` (exercise library, adaptation engine, data model) with the web app.

## Run on your iPhone (Expo Go)

```bash
# from the repo root
npm install
cp apps/mobile/.env.example apps/mobile/.env   # optional, see below
npm run mobile                                 # = expo start
```

Scan the QR code with the iPhone Camera app to open it in **Expo Go**. Your phone and
computer must be on the same Wi-Fi (or run `npx expo start --tunnel` in `apps/mobile`).

### Environment (`apps/mobile/.env`)

| Var | What it does |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Enables sign-in and sync with the web app. Without them the app runs in **guest mode** (data stays on the device). |
| `EXPO_PUBLIC_API_URL` | Base URL of the Anygym web app. AI gym scans call `POST /api/detect` there. For local dev use your computer's LAN IP, e.g. `http://192.168.1.20:3000`. |

Guest data is copied into the account automatically the first time you sign in.

## Screens

- **Today**: choose where you're training and a routine. It previews how many exercises get adapted, then starts a workout. Resumes an unfinished one.
- **Routines**: paste your program (`Back squat 4x6 @ 225`, one per line). Unrecognized lines can be matched by hand.
- **Gyms**: home gym plus travel gyms. *Scan a gym* takes photos or a video, extracts frames, and the AI detects equipment. You can toggle items and set the heaviest dumbbell.
- **Workout**: swapped exercises show a match %, target sets×reps, a load hint, cues and "last time" numbers. Log weight, reps and done per set. Autosaves.
- **History**: finished workouts with volume and how many were adapted on the road.

## Build for the App Store (EAS)

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build:configure        # creates eas.json, links the project
npx eas-cli@latest build --platform ios   # cloud build; no Xcode needed
npx eas-cli@latest submit --platform ios  # upload to App Store Connect / TestFlight
```

Set the `EXPO_PUBLIC_*` variables as EAS environment variables (or in `eas.json`) so the
production build has them. Bundle id: `com.anygym.app` (change it in `app.json` if needed).

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo export --platform ios   # verifies Metro bundling incl. the workspace package
```
