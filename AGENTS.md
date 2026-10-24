# AGENT.md

Guidance for AI coding agents working in the Jorna Pharmacy repo.

## Project Overview

Jorna Pharmacy is a pharmacy management app (medicines, purchases, sales, companies, customers, finance, users and roles). It runs on Cloudflare Workers with a D1 (SQLite) database.

## Tech Stack

- **Framework:** TanStack Start + TanStack Router (file-based routes), React 19, Vite 8
- **Database:** Drizzle ORM + drizzle-zod on Cloudflare D1
- **Auth:** better-auth, with role and permission checks in middleware
- **UI:** shadcn/ui-style components in `src/components/ui`, Tailwind CSS v4, `@base-ui/react`, lucide-react, TanStack Table
- **Forms and validation:** react-hook-form with zod v4
- **Tooling:** pnpm, TypeScript, ESLint, Prettier, Vitest, Storybook, Husky, commitlint

## Commands

Use `pnpm` (the repo uses `pnpm-lock.yaml` and `pnpm-workspace.yaml`).

| Task                  | Command                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Dev server            | `pnpm dev`                                                             |
| Build                 | `pnpm build`                                                           |
| Typecheck             | `pnpm typecheck`                                                       |
| Lint / fix            | `pnpm lint` / `pnpm lint:fix`                                          |
| Format / check        | `pnpm format` / `pnpm check`                                           |
| Tests                 | `pnpm test` (watch: `pnpm test:watch`, coverage: `pnpm test:coverage`) |
| Regenerate routes     | `pnpm generate-routes`                                                 |
| Storybook             | `pnpm storybook:dev` / `pnpm storybook:build`                          |
| Commit (conventional) | `pnpm commit` (commitizen)                                             |
| Deploy to cloudflare  | `pnpm deploy:prod` / `pnpm deploy:stage`                               |
| Generate cf type      | `pnpm cf-typegen`                                                      |

## Architecture

### Directory layout

- `src/routes/` - file-based TanStack Router routes. `(auth)/` holds auth pages, `dashboard/_dashboardLayout/` holds the authenticated dashboard (users, company, purchases, payments, and so on), and `api/` holds HTTP endpoints.
- `src/routeTree.gen.ts` - **generated** by the router. Do not edit by hand; run `pnpm generate-routes`.
- `src/features/<domain>/` - one folder per domain: `auth`, `medicine`, `purchase`, `role`, `user`, `company`. Each domain typically has:
  - `api/` - oRPC `*.contract.ts` (input and output schemas) and `*.procedure.ts` (implementation).
  - `components/` - domain UI.
- `src/server/` - oRPC setup: `orpc.ts`, `orpc.router.ts` (root router), and `middleware/auth.middleware.ts`.
- `src/db/schemas/` - Drizzle table definitions (`table/<domain>/`), enums (`enums/`), and shared helpers (`db-utils.ts`).
- `src/db/clients/` - database client creation.
- `src/db/utils/` - shared DB helpers: pagination helpers (`paginate-query/`) and D1 chunking helpers (`chunk-by-params.ts`).
- `src/db/seed/` - seed data: `dev-seed/` and `prod-seed/`, plus shared seed helpers.
- `src/db/generators/` - scripts that emit DBML and SQL schema files.
- `src/components/` - shared components: `ui/`, `data-table/`, `form-fields/`, `providers/`, `shared/`, `dev-panel/`, `time-range-filter/`.
- `src/lib/` - utilities, including `zod-schemas/`, `head/`, and `tanstack-query/`.
- `src/mail/` - email service and react-email templates.
- `src/constants/`, `src/hooks/`, `src/types/`, `src/utils/` - shared code.
- `migrations/` - D1 SQL migrations (`000N_*.sql`) plus `meta/` snapshots and `_journal.json`.
- `test/` - Vitest setup (`setup.ts`), used by unit tests.

## Conventions

- **Feature-first:** put new domain logic under `src/features/<domain>/`. Keep API contracts in `api/*.contract.ts` and implementations in `api/*.procedure.ts`.
- **Validate with zod:** define input and output schemas once in the contract and reuse them. Database-derived schemas come from `drizzle-zod` in `src/db/schemas`.
- **Permissions:** protected procedures must go through the auth middleware. Check roles and permissions there, not in UI code only.
- **Database changes:** edit the Drizzle schema, then stop and ask the user for permission before generating a migration. Do not run `pnpm db:generate` (or `pnpm db:generate-full`) on your own. Only generate a migration when the user explicitly says "generate migration". The user reviews every database change. Keep `full-schema.sql` and `schema.dbml` in sync with `pnpm db:generate-full` only after the user has approved. Do not edit old migrations.
- **Money:** money columns are `real`, created with the `db_money` helper in `src/db/schemas/db-utils.ts` (see migration `0010_money_as_real.sql`). Use the same helper for new money fields.
- **Generated files:** do not hand-edit `src/routeTree.gen.ts`, `worker-configuration.d.ts` (from `pnpm cf-typegen`), or `graphify-out/`.
- **Styling:** use existing `src/components/ui` primitives and Tailwind tokens. Do not add hard-coded colors when a token exists.
- **Formatting:** Prettier with `prettier-plugin-tailwindcss` and import sorting. Run `pnpm format` before committing.
- **Commits:** Conventional Commits, enforced by commitlint through Husky hooks. Use `pnpm commit` or follow the format manually.
- **Environment:** `.env*` files are gitignored. Never commit secrets or copy values from `.env.local` or `.env.production.local` into code. Use `.env.example` as the template.

## Testing

- Run `pnpm test` before claiming work is complete. Run `pnpm typecheck` and `pnpm lint` for code changes.
- Unit tests are `src/**/*.{test,spec}.{ts,tsx}`, run with Vitest in jsdom with Testing Library. Global setup is in `test/setup.ts`.
- Storybook stories (`*.stories.tsx`) are tested through the Storybook Vitest addon in a headless Chromium browser (Playwright).

## Test Implementation Docs

`docs/test-implementation/` is the living specification of every test the project should
have. `main-test-implementation.md` holds global rules and links; one child document per
code area holds the cases.

**This is mandatory work, not optional documentation.** Whenever you create, change,
rename, or delete application code, you must update the owning test-implementation
document in the same change:

1. Find the owning child document using the index in
   `docs/test-implementation/main-test-implementation.md`. If none exists, create one and
   link it from the index.
2. Add cases for new behavior, update cases for changed behavior, and mark removed
   behavior `Obsolete`. Keep IDs stable; never renumber or reuse an ID.
3. Verify each case's `Status` against the real test files: `Implemented` only when a
   test asserts the described outcome, `Partial` when incomplete, otherwise `Missing`.
4. Update the document's coverage summary counts.
5. Record any new test file in the document's source map.

Rules for the documents:

- Docs only. Never put runnable test code in `docs/test-implementation/`.
- Describe observable behavior, inputs, and expected outcomes, not implementation
  details that would break on refactor.
- Test code itself still lives next to the source (`src/**/*.test.ts[x]`).
- `src/db/schemas/**` is intentionally out of scope for these docs.
- Developers may edit the docs, but agents are responsible for keeping them in sync.
  A code change that leaves them stale is incomplete.

Before finishing any code change, confirm the owning document was checked and updated.

## Knowledge Graph (graphify)

A knowledge graph of this repo lives in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, `graph.html`). Use it for architecture and file-relationship questions:

- Query: `graphify query "<question>"`
- Shortest path between concepts: `graphify path "<A>" "<B>"`
- Explain a node: `graphify explain "<Node>"`
- Rebuild after code changes (no API cost): `graphify update .`

Caveats:

- The report was built from commit `0c96b323`. Check `git rev-parse HEAD` before relying on it, and rebuild if the code has changed.
- The graph includes `.opencode/skills/` (agent skill content) and generated type files such as `worker-configuration.d.ts`. These are not application code, so filter them out when reasoning about the app.
- `graphify-out/` is generated output. Do not edit it by hand.

## Things to Avoid

- Don't edit generated files (`routeTree.gen.ts`, `worker-configuration.d.ts`) or `graphify-out/`.
- Don't rewrite existing migration files. Add a new migration only after the user says "generate migration".
- Don't generate a migration when you change any database table without asking first. Always ask permission.
- Don't bypass the oRPC contract layer with ad-hoc `fetch` calls from the UI.
- Don't leave `docs/test-implementation/` stale after changing code, and don't put runnable test code in those docs.
- Don't mark a test case `Implemented` unless a real test asserts it.
- Don't commit `.env*` files or secrets.
