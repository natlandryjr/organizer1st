fly deployThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

**Local development** requires PostgreSQL. Use a local Postgres, [Docker](https://hub.docker.com/_/postgres), or a free cloud DB ([Neon](https://neon.tech), [Supabase](https://supabase.com)). Set `DATABASE_URL` in `.env` to your Postgres connection string, then run migrations:

```bash
npx prisma migrate dev
```

Then start the dev server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
