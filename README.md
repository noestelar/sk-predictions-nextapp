# SKToxqui Predictions

A Secret Santa predictions web application where participants can guess who will give gifts to whom during the Secret Santa exchange. Built with Next.js, the app features user authentication, prediction submission, results tracking, and winner leaderboards.

## Features

- **User Authentication**: Simple name-based login for predefined participants
- **Predictions**: Users can predict gifter-giftee pairs for the Secret Santa exchange
- **Admin Panel**: Set cutoff dates for predictions and record actual gift exchange results
- **Winners Page**: View leaderboard showing participants' prediction accuracy scores
- **Real-time Updates**: Dynamic content with automatic revalidation
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 with React 19 and App Router
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Optional Redis layer for predictions and leaderboard freshness
- **Authentication**: NextAuth.js with custom credentials provider
- **UI**: shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React

## Getting Started

This application runs on PostgreSQL, giving us relational guarantees and transactional safety for predictions, with Redis available to cache real-time views like the leaderboard.

### 1. Configure environment

```bash
cp .env.example .env.local
cp .env.example .env
```

Update the newly created `.env.local` (and `.env` for Docker Compose) with the secrets for NextAuth if you plan to use external providers.

### 2. Install dependencies

```bash
pnpm install
```

If you prefer containers, you can spin up PostgreSQL and Redis locally with:

```bash
docker compose up -d
```

The compose file exposes Postgres on `localhost:5432` and Redis on `localhost:6379`, matching the defaults in `.env.example`.

### 3. Sync and seed the database

Point `DATABASE_URL` at a running PostgreSQL instance (for example: `postgresql://postgres:postgres@localhost:5432/sk_predictions`). Then push the schema and seed:

```bash
pnpm dlx prisma db push
pnpm dlx prisma db seed
```

Alternatively, you can execute `init.sql` against your database to create and seed everything manually:

```bash
psql "$DATABASE_URL" -f init.sql
```

### 4. Run the development server

```bash
pnpm dev
```

By default the app is available at [http://localhost:3000](http://localhost:3000).

## Tooling

- [Next.js](https://nextjs.org) App Router with React 19
- [Prisma](https://www.prisma.io/docs) with a PostgreSQL datasource and Redis-backed caching helpers
- [shadcn/ui](https://ui.shadcn.com) components powered by Tailwind CSS (see `components/ui`)

Use `pnpm build` to verify the production bundle. This script runs `prisma db push` automatically so the PostgreSQL schema is aligned before packaging the app. If you enable Redis, set `REDIS_URL` so the caching helpers can connect.
