# Repository Guidelines

## Project Structure & Module Organization
- `src/routes` contains pages and server handlers; `+page.svelte` files render UI and `+page.server.ts` files handle form actions/loaders (see auth demo in `src/routes/demo/lucia`).
- Shared code lives in `src/lib`; server-only helpers are under `src/lib/server`, with authentication/session helpers in `auth.ts` and Drizzle schema/DB wiring in `db/schema.ts` and `db/index.ts`.
- Static assets served as-is belong in `static`; reusable app assets (favicons, etc.) sit in `src/lib/assets`.
- Database config is in `drizzle.config.ts`; set `DATABASE_URL` (use `file:local.db` for local SQLite) before running DB tasks.

## Build, Test, and Development Commands
- `npm run dev -- --open` starts the SvelteKit dev server.
- `npm run check` runs `svelte-kit sync` and `svelte-check` for type/syntax validation; run before PRs.
- `npm run lint` runs Prettier check then ESLint; `npm run format` auto-formats the repo.
- `npm run build` produces the production bundle; `npm run preview` serves that build locally.
- Database workflows: `npm run db:push` syncs schema to the target DB; `npm run db:generate` creates migrations; `npm run db:migrate` applies them; `npm run db:studio` opens Drizzle Studio for inspection.

## Coding Style & Naming Conventions
- We are on Svelte 5; use runes (`$state`, `$derived`, `$effect`) in new components and avoid legacy Svelte 4 patterns unless refactoring old code.
- TypeScript-first; keep Svelte components using `<script lang="ts">`. Prettier defaults (two-space indent, semicolons) apply across TS/Svelte.
- Components in `$lib` should use PascalCase filenames; route segments stay kebab-case and follow SvelteKit `+page`/`+page.server` naming.
- Keep DB queries inside `src/lib/server/db` helpers rather than directly in Svelte components; prefer small, pure utilities and reuse via `$lib`.
- Tailwind classes are fine inline; order classes logically (layout → spacing → typography → state) to stay readable.

## Testing Guidelines
- Current checks rely on `npm run check` plus linting; run them before pushing.
- If you add automated tests, colocate near the feature (`src/lib/server/__tests__/auth.test.ts`, `src/routes/demo/lucia/__tests__`) and use a disposable SQLite database driven by Drizzle for auth/session coverage.
- When touching auth, verify session renewal, cookie lifecycle, and login/register flows via the demo route before opening a PR.

## Commit & Pull Request Guidelines
- Use short Conventional Commit-style subjects, mirroring existing history (e.g., `chore: bootstrap SvelteKit ventlog app`); present tense, <=72 characters.
- PRs should include intent, testing performed (`npm run check`, `npm run lint`, DB commands), and any required env vars (`DATABASE_URL`) or migration steps.
- Add screenshots/GIFs for UI changes and note impacts to `drizzle` schema or sample data so reviewers can reproduce locally.
