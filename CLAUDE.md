# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 3000, proxies `/api` → `http://localhost:8080` (backend must run separately).
- `npm run build` — production build; treat as the correctness gate after any change (no separate test suite exists).
- `npm run preview` — serve the production build locally.
- `npx eslint .` — lint (no `lint` script is defined in package.json yet; invoke eslint directly).
- No test runner is configured in this repo.

## Architecture

WashMate is a multi-portal laundry/car-wash booking SPA: **Customer**, **Staff**, and **Admin** portals in one React 19 + Vite 8 + Tailwind v4 app, plain JS (no TypeScript). Routing is centralized in [src/routes/AppRoutes.jsx](src/routes/AppRoutes.jsx), with one layout per portal (`PublicLayout`, `AuthLayout`, `CustomerPortalLayout`, `StaffLayout`, `AdminLayout` in `src/layouts/`). Staff and Admin layouts share `PortalShell` (dark sidebar) for visual consistency. Protected routes are wrapped in `<RequireRole>` (`src/components/auth/RequireRole.jsx`) checking roles from `src/lib/auth-role.js` (`ROLES`).

### Data flow
- All HTTP calls go through **17 service modules in `src/api/*`** (`bookingApi.js`, `garageApi.js`, `adminApi.js`, …), each built on the shared `src/api/axiosClient.js` instance. Pages/components must never call `axios`/`fetch` directly — always through an `src/api/*` module.
- Data fetching is currently manual: pages `useEffect` + `useState` for `data/loading/error` themselves (no query cache library yet — see `PLAN_ARCHITECTURE.md` for the planned TanStack Query migration, not yet started).
- Auth/session state is split across `src/utils/authUtils.js`, `src/lib/auth-role.js`, and `src/lib/auth-session.js` (planned to be unified into a single `src/lib/auth.js` — not done yet, so check all three when touching auth/session code). Tokens currently mirror into both `localStorage` and `sessionStorage`.

### UI/design system
- **Design tokens are single-sourced in `src/index.css`** (colors, radii, shadows as CSS custom properties under `@theme inline`); `DESIGN.md` documents the same values and must be kept in sync if a token changes. `src/lib/chart-colors.js` is the one hex-value mirror for Recharts (`CHART` + `STATUS_COLORS`) since charts can't consume CSS vars directly.
- Never hardcode raw hex/Tailwind palette colors (`bg-blue-600`, `#2563eb`, etc.) in components — always use the semantic token classes (`bg-primary`, `text-muted-foreground`, `border-input`, …) from `src/index.css`.
- Rounding: only `rounded-xl` (controls), `rounded-2xl` (cards/panels, default), `rounded-3xl` (hero/banner). No arbitrary `rounded-[...]`.
- Shadows: only the 3 tokens `shadow-card`, `shadow-floating`, `shadow-cta`. No arbitrary `shadow-[...]`.
- Shared primitives live in `src/components/shared/` (`PageContainer`, `PageHeader`, `StatusBadge` + `src/lib/status-tones.js`, `PortalShell`) and `src/components/ui/` (Base UI-based: `toast.jsx` with `createToastManager`, `alert-dialog.jsx`, `skeleton.jsx`, `ConfirmDialog.jsx`). Use `toast.success/error/info` and `confirmDialog()` instead of `alert()`/`window.confirm()`.
- No toast library is installed beyond the in-repo Base UI wrapper — do not add `sonner` (an earlier plan considered it, but the shipped implementation is the custom `ui/toast.jsx`).

### Structure conventions
- `src/pages/{admin,staff,customer-portal,auth,public}/` — route-level pages, one per route.
- `src/components/{admin,staff,customer-portal,...}/` — portal-scoped components; `src/components/admin/dashboard/` shows the convention for splitting a fat page into `<page>/`-scoped section components.
- `src/lib/` — non-API business logic/helpers (booking flow state, formatting, static data, tokens).
- `src/api/` — HTTP layer only, one file per backend resource.
- New files: pages/layouts use PascalCase; other modules use kebab-case, matching existing files.

### Known in-progress state (see PLAN_ARCHITECTURE.md, PLAN_DESIGN.md, DESIGN.md)
A large refactor is underway and partially complete: dead-code removal and design-token unification (Plan A/B1/C) are done; TanStack Query migration, auth module unification, route lazy-loading, and splitting oversized pages (B2–B6) are **not yet done**. When working in areas these phases touch (auth, data fetching, `AppRoutes.jsx`, large pages like `AdminInsightPage`/`AccountPage`/`VehiclesPage`), check the relevant PLAN file before assuming the target-state pattern is already in place.
