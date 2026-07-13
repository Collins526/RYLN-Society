# Rift Youth Leadership Network (RYLN)

A full-stack society management website for the Rift Youth Leadership Network — public-facing pages, member registration/login, and an admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, TanStack Query
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (stored in localStorage as `ryln_token` / `ryln_user`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts (30+ endpoints)
- `lib/db/src/schema/` — Drizzle ORM schema (members, announcements, activities, gallery, contact_messages, leadership)
- `lib/api-client-react/src/generated/` — generated React Query hooks and Zod schemas (do not edit)
- `artifacts/ryln/src/` — React frontend (pages, components, hooks)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — JWT middleware

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks. Never write fetch calls by hand.
- JWT auth stored in localStorage; `Authorization: Bearer <token>` header injected by custom fetch wrapper in `lib/api-client-react/src/custom-fetch.ts`.
- Admin role gated at API layer via `requireAuth` + `requireAdmin` middleware; frontend checks `user.role === 'admin'` for UI routing.
- `dateOfBirth` is stored as a `date` string in Postgres; must convert `Date` objects to `YYYY-MM-DD` string before Drizzle insert.
- Express 5 types `req.params.id` as `string | string[]`; always cast: `parseInt(req.params.id as string)`.

## Product

- **Public pages**: Home (hero, stats, announcements), About (leadership team, mission), Programs/Activities, Gallery, Contact form
- **Member portal**: Registration form → pending approval, Login, Member profile
- **Admin dashboard**: Member management (approve/suspend/reject/delete), Announcements CRUD, Activities CRUD, Gallery management, Contact messages inbox, Leadership team management, Stats overview

## Credentials (seed data)

- Admin: `admin@ryln.org` / `Admin@RYLN2024`
- Members: `james.k@email.com` … `peter.k@email.com` / `Member@1234`
- Pending member: `brian.m@email.com` / `Member@1234`

## Gotchas

- Do NOT run `pnpm dev` at workspace root — use workflows or `pnpm --filter` commands.
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before touching frontend code.
- `pg` is NOT in the pnpm workspace catalog — add it with an explicit version string, not `catalog:`.
- The shadcn table component exports `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` — not the shorthand `Body`, `Cell`, etc.
- JWT secret falls back to `ryln-secret-2024` if `SESSION_SECRET` is not set.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
