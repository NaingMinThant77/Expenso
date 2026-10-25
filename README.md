# Expenso

Expenso is a personal income and expense tracker that installs on your phone like a native app and keeps working without internet.

**Live app:** https://expenso-iota.vercel.app/

---

## What is a PWA?

**PWA = Progressive Web App.** It is a normal website that behaves like a mobile/desktop app. You build it once with web technology and users can:

- **Install it** to their home screen (no App Store / Play Store needed) and open it full-screen, with its own icon and splash screen.
- **Use it offline** — a *service worker* (a background script in the browser) caches the app and its data, so it still opens with no connection.
- **Get push notifications**, even when the app is closed.
- **Get updates instantly** — it's still a website, so deploying a new version updates everyone.

How Expenso does this:

| PWA piece | Where it lives |
| --- | --- |
| Web App Manifest (name, icons, colors, standalone mode) | [app/manifest.ts](app/manifest.ts) |
| Service worker generation (Workbox via `@ducanh2912/next-pwa`) | [next.config.ts](next.config.ts) |
| Custom service worker code for push notifications | [worker/index.js](worker/index.js) |
| "Install app" prompt | [components/pwa/install-prompt.tsx](components/pwa/install-prompt.tsx) |
| Offline banner | [components/pwa/offline-banner.tsx](components/pwa/offline-banner.tsx) |
| App icons and iOS splash screens | [public/icons/](public/icons/), [public/splash/](public/splash/) |

> The service worker is **disabled in development** (`npm run dev`) and only generated in production builds (`npm run build`). To test PWA/offline features, run `npm run build && npm start`.

**How to install it:** open the live link on your phone → Chrome/Android: menu → *Install app*; iPhone Safari: Share → *Add to Home Screen*.

---

## Features

- **Dashboard** — summary cards (income, expense, balance) and recent transactions.
- **Transactions** — add, edit, delete; fields: amount, income/expense type, category, date, shop, memo, payment method. Includes search/filters and pagination.
- **Categories** — default categories plus your own custom ones (name, icon, color), manageable in Settings.
- **Calendar** — month view showing each day's activity, a day-detail dialog, an income-vs-expense chart and a category donut chart.
- **Shopping lists** — create lists with items and amounts, tick items off.
- **Multi-currency** — choose your currency (MMK default, plus USD, EUR, GBP, JPY, THB, SGD, INR, CNY, KRW, AUD, MYR).
- **Authentication** — register/login with username, email and password (bcrypt-hashed). Google sign-in is built in but currently commented out in the login/register forms.
- **Profile settings** — edit profile, upload avatar, dark/light theme toggle, logout.
- **Offline-first** — transactions can be created/edited/deleted with no internet. Changes are stored on the device (IndexedDB) in an "outbox" and synced automatically when the connection returns. See [lib/offline/](lib/offline/) and [context/offline-context.tsx](context/offline-context.tsx).
- **Daily push reminder** — opt in from Settings; a Vercel Cron job sends a "log today's spending" notification every day.
- **Responsive UI** — bottom tab bar on mobile, sidebar on desktop, animated page transitions.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) |
| Language | **TypeScript**, **React 19** |
| Styling / UI | **Tailwind CSS v4**, **shadcn/ui** + Radix UI, lucide-react icons, Motion (animations), Sonner (toasts), next-themes |
| Forms / validation | React Hook Form + **Zod** |
| Database | **PostgreSQL** with **Prisma** ORM (schema and migrations in [prisma/](prisma/)) |
| Auth | **Auth.js (next-auth v5)** with Prisma adapter, credentials + Google provider, bcryptjs |
| PWA | `@ducanh2912/next-pwa` (Workbox), Web App Manifest |
| Offline storage | IndexedDB via `idb` |
| Push notifications | Web Push API with VAPID keys (`web-push`) |
| Charts / dates | date-fns, react-day-picker, custom chart components |
| Hosting | **Vercel** (with Vercel Cron) |

## Project structure

```
app/
  (app)/        Logged-in pages: dashboard, transactions, shopping, calendar, settings
  (auth)/       Login and register pages
  api/          Auth.js route and the daily-reminder cron endpoint
  manifest.ts   PWA manifest
components/     UI (ui/ = shadcn), shell, transactions, calendar, shopping, pwa, settings...
lib/            actions/ (server actions), data/ (queries), offline/ (sync engine), validations/
context/        Currency, theme and offline-sync React contexts
prisma/         schema.prisma, migrations, seed
worker/         Custom service-worker code (push handling)
auth.ts         Auth.js configuration
proxy.ts        Route protection (redirects logged-out users)
vercel.json     Cron schedule (daily reminder)
```

Database models: `User`, `Account`, `Session`, `VerificationToken`, `Category`, `Transaction`, `PushSubscription`, `ShoppingList`, `ShoppingListItem`.

---

## Getting started (local development)

**Requirements:** Node.js 20+, a PostgreSQL database (local or hosted, e.g. Neon/Supabase).

```bash
npm install
```

Create a `.env` file in this folder:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth.js secret — generate with: npx auth secret   (or: openssl rand -base64 32)
AUTH_SECRET=

# Google OAuth (only needed if you re-enable Google sign-in)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Web Push — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com

# Protects the cron endpoint (Vercel sends it as "Authorization: Bearer <value>")
CRON_SECRET=
```

Set up the database and run:

```bash
npx prisma migrate dev     # create tables
npx tsx prisma/seed.ts     # optional: seed default categories
npm run dev                # http://localhost:3000
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server (service worker off) |
| `npm run build` | `prisma generate` + production build with webpack (generates the service worker) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

---

## Deployment (Vercel)

The app is deployed at **https://expenso-iota.vercel.app/**.

1. Push the repo to GitHub/Bitbucket and import it in [Vercel](https://vercel.com/new).
2. Add all the environment variables from the list above in *Project Settings → Environment Variables*.
3. Point `DATABASE_URL` at a hosted PostgreSQL database and run `npx prisma migrate deploy` against it.
4. Deploy. Vercel runs `npm run build` and, thanks to [vercel.json](vercel.json), calls `/api/cron/daily-reminder` every day at 01:30 UTC to send push reminders.

Every push to the connected branch redeploys automatically.

---

## Notes for new developers

- This is Next.js 16 / React 19 — some APIs differ from older versions; check [AGENTS.md](AGENTS.md) and the docs in `node_modules/next/dist/docs/` before assuming old behavior.
- The production build intentionally uses `--webpack` because the PWA plugin (Workbox) does not work with Turbopack.
- Offline data is scoped per user in IndexedDB and cleared when a different user logs in.
