# CLAUDE.md — Fundora

Project guide for Claude Code. Full plan: `FUNDORA_ARCHITECTURE.md`.

## What this is

Fundora: a website where an undergraduate student fills one profile and sees every scholarship, aid and grant they qualify for, sorted into **Eligible / Almost eligible / Not eligible**, each with a plain-language reason. Covers 19 UG course categories in India.

**Hard scope rule:** Fundora guides and lists. It never fills or submits forms, holds portal logins, processes payments or charges fees. Students always apply via the scheme's official link. Do not build features that cross this line.

## Stack

- Monorepo: `apps/web` (React 18 + Vite + Tailwind + shadcn/ui), `apps/api` (Node 20 + Express + Mongoose), `packages/shared` (Zod schemas, rule types, eligibility engine)
- DB: MongoDB Atlas · Auth: bcrypt + JWT in httpOnly cookies · Email: Resend/Brevo · Jobs: node-cron
- Tests: Vitest (unit), Supertest (API), Playwright (e2e)
- Hosting: Vercel (web), Render/Railway (api)

## Commands

```bash
npm install            # from repo root (workspaces)
npm run dev            # web + api together
npm run dev -w apps/api
npm run dev -w apps/web
npm test               # all workspaces
npm run lint
npm run seed -w apps/api   # seed schemes + admin user
```

Update this section if scripts change.

## Architecture rules

1. **Eligibility logic lives only in `packages/shared/eligibility`.** `evaluate(profile, scheme)` is a pure function (no DB, no I/O). Both the API and the admin live preview import it. Never duplicate rule logic in routes or components.
2. **Scheme rules are data, not code.** Adding or editing a scheme must never require a code change. Rules: `{ field, op, value, hard?, nearMargin? }`. Operators: `eq, in, notIn, lte, gte, between, exists, isTrue`. Adding an operator = add it + its reason template + tests.
3. **States:** Eligible = all rules pass. Almost = all hard rules pass and ≤2 soft rules within `nearMargin`. Not eligible = otherwise. Every result carries reasons.
4. **Matching flow:** Mongo prefilter on indexed fields → `evaluate` → score → sort → cache in `matchResults` keyed by `profileVersion`. Bump `profileVersion` on any profile save; invalidate on scheme edit.
5. **API:** all routes under `/api/v1`, Zod-validate every body, use `requireAuth` / `requireRole('student'|'counsellor'|'admin')`.
6. **Shared types:** Zod schemas in `packages/shared` are the single source of truth for profile and scheme shapes; infer TS types from them.

## Privacy rules (non-negotiable)

- Encrypt `familyIncome`, `category`, `disability` at rest (AES-256-GCM, key from env). Never log these values.
- Never store Aadhaar numbers, bank account numbers, government ID numbers or portal passwords. Use yes/no flags only (e.g. `bankAadhaarSeeded: boolean`).
- Counsellors only see students who accepted a link request. Impact stats are aggregates only.
- Account deletion must remove profile, matchResults, applications and notifications.
- Never commit `.env`; keep `.env.example` current.

## Trust rules

- Every scheme needs `officialUrl`, `sourceUrl` and `lastVerifiedAt`. Admin save rejects schemes missing them.
- Flag schemes not verified in 90 days. Weekly job checks official links.
- Every admin scheme edit writes to `auditLogs`.

## Collections

users · profiles · schemes · applications · matchResults · notifications · reports · organizations · stories · auditLogs

## Conventions

- TypeScript everywhere; ESLint + Prettier must pass before commit (Husky).
- Mobile-first UI; users are often on low-end Android and slow networks. Keep bundles small.
- i18n via react-i18next (English first, then Kannada and Hindi). No hard-coded user-facing strings.
- Money in rupees as integers. Dates stored as UTC ISO; display in IST.
- Tests required for: every eligibility operator and state boundary (at limit, 1 over, past margin), every API route including role checks.

## Build phases (current order)

0 Setup → 1 Auth → 2 Profile → 3 Schemes + admin → 4 Eligibility engine → 5 Discovery UI → 6 Tracker + reminders → 7 Trust → 8 Dashboards → 9 Test + launch → 10 Internships (v2)

## Team

Haripriya V, Harshit Kumar, Eshaan Brahimi — BMS College of Engineering, Bengaluru.
