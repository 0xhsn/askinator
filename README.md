# Askinator

A small Q&A app built with Next.js and deployed to Cloudflare Pages, using Cloudflare D1 (SQLite) and Drizzle ORM.

This guide covers:
- Local development
- Setting up Cloudflare D1 and running migrations with Drizzle
- Previewing locally with Cloudflare bindings
- Deploying to Cloudflare Pages with a D1 binding

---

## Tech stack
- Next.js 15
- React 19
- Cloudflare Pages + Workers runtime (via `@cloudflare/next-on-pages`)
- Cloudflare D1 (SQLite)
- Drizzle ORM + `drizzle-kit` (driver: `d1-http`)
- Tailwind CSS 4

Relevant files:
- `db/migrations/schema.ts` — database schema
- `db/index.ts` — Drizzle DB factory for D1
- `drizzle.config.ts` — Drizzle Kit config (uses D1 HTTP driver)
- `wrangler.jsonc.example` — example Wrangler config with D1 binding
- `next.config.ts` — enables bindings in `next dev` via `next-on-pages`

The app expects a D1 binding named `DB` (see `worker-configuration.d.ts`).

---

## Prerequisites
- Node.js 20+
- pnpm 9+
- Cloudflare Wrangler CLI (`npm i -g wrangler`)
- A Cloudflare account (to create a D1 database and Pages project)

---

## 1) Install dependencies

```bash
pnpm install
```

---

## 2) Configure Wrangler and the D1 binding

Create `wrangler.jsonc` at the project root based on `wrangler.jsonc.example` and set the D1 binding. The binding name must be `DB`.

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "askinator",
  "compatibility_date": "2025-07-30",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".vercel/output/static",
  "d1_databases": [
    {
      "binding": "DB", // required binding name used by the app
      "database_name": "askinator-db",
      "database_id": "<your-d1-database-id>"
    }
  ]
}
```

Create a D1 database and copy its ID:

```bash
wrangler d1 create askinator-db
wrangler d1 list                  # find the database_id
```

---

## 3) Configure Drizzle Kit credentials (for migrations)

`drizzle.config.ts` uses the D1 HTTP driver and reads these environment variables:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`
- `CLOUDFLARE_D1_TOKEN`

How to obtain values:
- `CLOUDFLARE_ACCOUNT_ID`: `wrangler whoami` or Cloudflare dashboard
- `CLOUDFLARE_DATABASE_ID`: the D1 `database_id` you created above
- `CLOUDFLARE_D1_TOKEN`: Cloudflare API token with D1 Edit permissions (User API Tokens)

Export them in your shell before running migrations:

```bash
export CLOUDFLARE_ACCOUNT_ID="<your-account-id>"
export CLOUDFLARE_DATABASE_ID="<your-d1-database-id>"
export CLOUDFLARE_D1_TOKEN="<your-api-token>"
```

---

## 4) Apply the database schema (migrations)

This project defines the schema in `db/migrations/schema.ts`. Push it to your D1 database with Drizzle Kit:

```bash
# Using pnpm dlx
pnpm dlx drizzle-kit push

# or with npx
npx drizzle-kit push
```

This will create the `questions` table in your D1 instance.

---

## 5) Run locally (Next.js with Cloudflare bindings)

`next.config.ts` calls `setupDevPlatform()` from `@cloudflare/next-on-pages`, which reads `wrangler.jsonc` and wires your bindings (like `DB`) into local `next dev`.

```bash
pnpm dev
```

Alternatively, you can preview the Pages Worker locally (simulates production build):

```bash
pnpm preview   # runs: pages:build && wrangler pages dev
```

---

## 6) Deploy to Cloudflare Pages with D1

1. Create a Pages project (via Dashboard or CLI) and connect this repo if desired.
2. Ensure the Pages project has a D1 binding named `DB` pointing to your database:
   - Dashboard → Pages → your project → Settings → Functions → D1 Databases → Add binding
   - Binding name: `DB`
3. Set the same `compatibility_date` and `nodejs_compat` flag as in `wrangler.jsonc`.
4. Deploy using the provided script:

```bash
pnpm deploy   # runs: pages:build && wrangler pages deploy
```

The build step uses `@cloudflare/next-on-pages` to produce a Pages-compatible output. `wrangler pages deploy` uploads it and attaches your D1 binding.

---

## 7) Running migrations against production

Point your environment variables at the production D1 database and run Drizzle push again:

```bash
export CLOUDFLARE_ACCOUNT_ID="<prod-account-id>"
export CLOUDFLARE_DATABASE_ID="<prod-d1-database-id>"
export CLOUDFLARE_D1_TOKEN="<prod-api-token>"

pnpm dlx drizzle-kit push
```

If you prefer using Wrangler’s SQL executor, you can generate SQL with Drizzle and apply via `wrangler d1 execute`, but `drizzle-kit push` is the most straightforward here.

---

## Notes
- The app is a personal project; no production-grade auth is implemented.
- Binding name must be `DB` to match the code and generated types in `worker-configuration.d.ts`.
- If you change the binding name, update it in `wrangler.jsonc`, your Pages project bindings, and any code consuming `env.DB`.

---

## Useful scripts
- `pnpm dev` — Next.js dev server with Cloudflare bindings
- `pnpm preview` — Build and preview with Pages runtime locally
- `pnpm deploy` — Build and deploy to Cloudflare Pages
- `pnpm cf-typegen` — Generate `env` interface types for bindings

---

## Troubleshooting
- Missing binding `DB` in dev: ensure `wrangler.jsonc` exists and includes the `d1_databases` section with the correct `database_id`.
- Drizzle auth errors: confirm your API token has D1 Edit permissions and the three Drizzle env vars are set in the shell where you run `drizzle-kit`.
- Local preview vs dev: `pnpm dev` runs the Node dev server with bindings; `pnpm preview` compiles and emulates the Pages Worker environment.
