This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local Setup (Test Organizer + Attendee Views)

**1. Database** – PostgreSQL required. Choose one:

- **Local Postgres:** `createdb organizer1st` then set `DATABASE_URL` in `.env`
- **Docker:** `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=organizer1st postgres`
- **Fly Postgres (remote):** `fly proxy 5432 -a organizer1st-db` then `DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/postgres"`
- **Neon / Supabase:** Create a project and copy the connection string

**2. Environment** – Copy `.env.example` to `.env` and set at minimum:

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET (any random string)
# Optional for full features: Stripe keys, SMTP for emails
```

**3. Migrations & seed:**

```bash
npx prisma migrate dev
npm run db:seed
```

**4. Start dev server:**

```bash
npm run dev
```

**5. Test both views:**

| View | URL | Notes |
|------|-----|-------|
| **Demo hub** | [http://localhost:3000/demo](http://localhost:3000/demo) | Choose organizer or attendee |
| **Attendee view** | [http://localhost:3000/demo](http://localhost:3000/demo) → "Attendee view" | Book seats, pick seats on chart |
| **Organizer view** | [http://localhost:3000/demo](http://localhost:3000/demo) → "Organizer view" | Events, venues, orders |
| **Log in as organizer** | [http://localhost:3000/login](http://localhost:3000/login) | demo@organizer1st.com / Demo1234! |
| **Super admin** | [http://localhost:3000/admin5550](http://localhost:3000/admin5550) | Full platform CRUD |

## Getting Started (Quick Reference)

**Local development** requires PostgreSQL. Set `DATABASE_URL` in `.env`, then:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

**Seed creates:**
- **Sample Organizer** – demo organization
- **Sample Event** – 200 seats (10 tables×4, 2 sections×80)
- **Demo account** – demo@organizer1st.com / Demo1234!

Open [http://localhost:3000](http://localhost:3000) with your browser.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Fly.io

1. **Install Fly CLI** and sign in: [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)

2. **Create a Postgres database:**
   ```bash
   fly postgres create
   ```
   Choose a name, region, and the "Development" preset for a single machine.

3. **Launch the app and attach Postgres** (creates app + `DATABASE_URL` secret):
   ```bash
   fly launch --no-deploy
   fly postgres attach <your-postgres-app-name>
   ```

4. **Set secrets:**
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_live_...
   fly secrets set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   fly secrets set NEXT_PUBLIC_APP_URL=https://organizer1st.fly.dev
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

Migrations run automatically on each deploy via `release_command`. The app will be at `https://organizer1st.fly.dev` (or your chosen app name).

## Mobile Apps (Capacitor)

The project includes [Capacitor](https://capacitorjs.com/) for building native iOS and Android apps. The mobile apps load the deployed web app in a native shell.

**Prerequisites:**
- Xcode (macOS, for iOS)
- Android Studio (for Android)
- Deploy the web app first (Fly.io or similar)

**Build and run:**

```bash
# Sync web assets to native projects
npm run cap:sync

# Open in Xcode (iOS)
npm run mobile:ios

# Open in Android Studio (Android)
npm run mobile:android
```

**App Store submission:**
- **iOS:** Open `ios/App/App.xcworkspace` in Xcode, configure signing, then Archive and submit via App Store Connect
- **Android:** Open `android` in Android Studio, build a release APK/AAB, then upload to Google Play Console

**Custom URL:** Set `CAPACITOR_SERVER_URL` when building to point to a different backend (e.g. staging).
