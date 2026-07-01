---
name: RYLN auth and Express 5 quirks
description: Non-obvious backend patterns for the RYLN api-server
---

**dateOfBirth coercion:** Zod schema uses `z.coerce.date()` for `dateOfBirth` (because OpenAPI format is `date`). Before a Drizzle insert the value may be a `Date` object — convert it: `dateOfBirth instanceof Date ? dateOfBirth.toISOString().slice(0, 10) : String(dateOfBirth)`.

**Express 5 params cast:** Express 5 types `req.params.id` as `string | string[]`, so `parseInt(req.params.id)` fails TS. Always cast: `parseInt(req.params.id as string)`.

**JWT storage keys:** Frontend stores auth token in localStorage as `ryln_token` and the user object as `ryln_user`. Custom fetch wrapper in `lib/api-client-react/src/custom-fetch.ts` reads `ryln_token` and injects the `Authorization: Bearer` header.

**JWT secret:** Reads from `SESSION_SECRET` env var; falls back to hardcoded `ryln-secret-2024` for local dev.

**Why:** These are the precise patterns that caused build/runtime failures during initial implementation.
