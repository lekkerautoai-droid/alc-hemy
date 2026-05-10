# 🐾 Bells & Paws

A friendly little booking app for **Anabel Brink's** pet sitting & dog walking business in Cape Town CBD.

Clients pick a service, a day, a time, leave their pet's details — done. Anabel logs in to a private admin dashboard to manage bookings, hours, and prices.

---

## Quick start (for Anabel)

> You need **Node.js 18+** installed. If you don't have it, grab the LTS from [nodejs.org](https://nodejs.org).

```bash
# 1. install everything
npm install

# 2. copy the example env file and fill it in
cp .env.example .env.local

# 3. set up the database
npm run db:push
npm run db:seed

# 4. start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) 🌷

The admin dashboard lives at [http://localhost:3000/admin](http://localhost:3000/admin) — sign in with the password you set in `.env.local`.

---

## Filling in `.env.local`

Open `.env.local` and update these values:

| Key | What it does |
| --- | --- |
| `DATABASE_URL` | Where the database file lives. Leave as-is for local dev. |
| `ADMIN_PASSWORD` | The password Anabel uses to log into the admin dashboard. **Change this!** |
| `ADMIN_SESSION_SECRET` | A long random string to keep sessions secure. Generate one with `openssl rand -base64 32`. |
| `RESEND_API_KEY` | (optional) Get a free key at [resend.com](https://resend.com) so booking emails go out. |
| `SITTER_EMAIL` | Your email — booking notifications go here. |
| `NEXT_PUBLIC_SITTER_PHONE` | WhatsApp number in international format (e.g. `27821234567`). |
| `NEXT_PUBLIC_SITTER_NAME` | Display name shown around the site. |
| `NEXT_PUBLIC_SERVICE_AREA` | Service area shown on the landing page. |

---

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server. |
| `npm run db:push` | Apply the Prisma schema to the database. |
| `npm run db:seed` | Add the default services + availability hours. |
| `npm run db:studio` | Open Prisma Studio — a visual database editor. |
| `npm run build` | Build the production version. |
| `npm run start` | Run the production build. |

---

## Project layout

```
app/
  page.tsx                  ← landing page (with shader animation)
  book/                     ← public 5-step booking flow
  admin/                    ← password-protected dashboard
  api/                      ← booking + availability + auth endpoints
components/ui/              ← shadcn-style primitives + shader
lib/                        ← prisma client, auth, email, helpers
prisma/
  schema.prisma             ← database schema
  seed.ts                   ← default services + hours
```

---

## Deploying to Cloudflare Pages or Vercel

The fastest path is **Vercel**:

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add all the env vars from your `.env.local` in Vercel's dashboard.
4. For production, swap the SQLite database for a hosted PostgreSQL (e.g. [Neon](https://neon.tech) free tier). Update `DATABASE_URL` and change the `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`, then run `npx prisma db push`.

Cloudflare Pages also works — Pages now supports Next.js via the `@cloudflare/next-on-pages` adapter. Vercel is easier for first-time deploys.

---

## How the booking flow works

1. **Service** — clients pick a service (cards from the database).
2. **Date** — shows the next 21 days; only days with at least one open slot are clickable.
3. **Time** — slots are computed from your weekly availability rules, minus blocked days, minus existing bookings.
4. **Details** — name, SA-format phone, email, address, pet info, optional notes.
5. **Done** — booking ref, calendar download, WhatsApp shortcut, and (if Resend is configured) emails sent to both client and Anabel.

No money changes hands online — the confirmation tells the client to pay on the day in cash or by EFT.

---

## Made with 🐾 in Cape Town
