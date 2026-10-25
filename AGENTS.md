# Super Admin Dashboard (Mazen)

One of four independent apps in `~/Projects/Mazen` — the cross-app facts (stack, Tailwind v4 tokens, ports, Figma/RTL gotchas, layout checklist) live in the root `../AGENTS.md`; this file only covers what is specific to this app.

## Commands

- Always `cd Super_Admin_Dashboard_Mazen` first — there is no root workspace.
- Use **npm**, not pnpm: `npm install` / `npm run dev`. `pnpm-lock.yaml` and `pnpm-workspace.yaml` exist but are stale (the workspace file is an unfilled pnpm prompt placeholder); the Dockerfile installs from `package-lock.json` via `npm install`.
- `npm run dev` and `npm run start` already pin **port 3003** — don't pass `--port`.
- `npx tsc --noEmit` is the only real verification (strict, passes today). `next.config.mjs` sets `eslint.ignoreDuringBuilds` **and** `typescript.ignoreBuildErrors`, so a green `npm run build` proves nothing about types.
- `npm run lint` (`next lint`) has no ESLint config or `eslint` dependency — it prompts interactively to set up ESLint. Don't rely on it; don't add a config unless asked.
- No tests or test runner exist.

## Routing & i18n (next-intl)

- All routes are under `src/app/[locale]/` in route groups `(dashboard)` and `(auth)`. `src/app/layout.tsx` is a deliberate pass-through; the real `<html lang dir>` shell is `src/app/[locale]/layout.tsx` (sets `dir="rtl"` for `ar`).
- Locales `en`/`ar`, `localePrefix: 'as-needed'` (`src/i18n/routing.ts`): `/` serves en, `/ar` serves ar.
- Import `Link`, `useRouter`, `usePathname` from `@/i18n/routing` — importing from `next/link`/`next/navigation` drops the locale prefix.
- Every user-visible string goes into **both** `messages/en.json` and `messages/ar.json`; keys are kept in exact lockstep (630 each) — a missing key is a runtime error, not a fallback. Namespaces: `meta.<route>` (title/description consumed by `src/lib/routeMetadata.ts`), `common.*` (actions/status/roles/planTiers/billingCycles), `sa.<page>` (page and modal copy).
- Arabic content for mock records is stored as parallel `xxx_ar` fields on the same object; read them with `pickAr`/`locField` from `src/lib/localize.ts` (en stays source of truth, ar falls back to en). `localize.ts` also has `toArDate`, `tierArLabel`, `billingCycleAr` — reuse instead of hand-writing Arabic.
- Directional icons: add class `rtl-flip` (mirrored automatically under `[dir="rtl"]` in `globals.css`).

## Data & state (no backend)

- Frontend-only: no `fetch`, no API client, no localStorage, and nothing in `src/` reads env vars (`NEXT_PUBLIC_API_URL` is a Docker build ARG that is currently unused in code).
- Mock data: `src/data/mockData.ts`, `src/data/figmaPlans.ts`. Session-shared mutations go through the module stores `src/data/restaurantStore.ts` and `src/data/userStore.ts` — use their helpers (`addRestaurant`, `updateRestaurant`, …) so create → view → edit → delete stays consistent across pages; pages mirror the store into local state.
- Modals/drawers are deep-linked: open state comes from `useQueryModal(name)` in `src/lib/use-query-modal.ts` (`?modal=<name>`, browser Back closes it, uses `window.history` so no Suspense boundary is needed). Never swap it back to `useState(false)`; payload params (`id`, `step`) use `readQueryParam`/`writeQueryParam`.
- Auth pages are decorative: login just `setTimeout`s then `router.push('/')`. There is no session or route guard to find.

## Layout & visuals

- Fix the shared shell (`src/app/[locale]/(dashboard)/layout.tsx`, `src/components/Sidebar.tsx`, `Topbar.tsx`) before individual pages; see the checklist in `../Restaurant_Owner_Dashboard_Mazen/.opencode/skills/layout-space-fix/SKILL.md` (root AGENTS.md).
- The dashboard shell has class `sa-density` → `zoom: 0.85` (`globals.css`). Page spacing is authored against that zoom — don't rescale px values to compensate.
- Design tokens are declared in `@theme` in `src/app/globals.css` (brand `#026F4F`, bg `#F2F2F2`, ink `#2D2F33`); typography uses arbitrary Tailwind values per Figma output. The `font-satoshi` gotcha in root AGENTS.md applies here too.
- `tsconfig.json` has `@/*` → `./src/*`; keep it.

## Deploy

- `output: 'standalone'`; the container serves on 3003 (`PORT=3003`, healthcheck `GET /`). `docker-compose up` requires the external `dokploy-network` and Traefik labels for `superadmin.kodevio.com` / `superadmin-dashboard.kodevio.com`.
