# Fundora — Architecture & Build Plan

As of 2026-10-27 · BMS College of Engineering, Bengaluru

## 1. Overview

Fundora is a MERN web app where an undergraduate fills one profile and gets every scholarship, aid and grant sorted into **Eligible**, **Almost eligible** or **Not eligible**, each with a reason. It guides and lists; students always apply on the official site.

**In scope (v1)**

- Student sign-up, email verification and a step-by-step profile
- A scheme database covering 19 UG course categories: scholarships, loans, fee waivers, laptop/book, hostel/travel, coaching, and schemes for girls, disabled and rural students
- Rule-based eligibility engine with reasons ("You are Rs. 30,000 above the income limit")
- Opportunity page: amount, deadline, documents, steps, last-verified date, official link
- Application tracker (Saved, Applying, Applied, Awarded, Renewal due) and email reminders
- Trust layer: verified-source badges, scam warnings, report-wrong-info
- Admin panel where scheme rules are data, so a new scheme needs no code change
- Counsellor/NGO dashboard and an impact dashboard

**Never in scope:** filling or submitting forms, holding portal logins, processing payments, charging fees.

**v2:** internships (virtual, summer, NGO/research, open source, campus ambassador), skill matching and a resume builder.

## 2. System architecture

Three tiers: a React frontend, an Express REST API and MongoDB, plus an email service and scheduled jobs. The match engine is the core; every other module feeds it or acts on its results.

```
 Student ─┐                         ┌──────────── Express API (Render) ────────────┐
 Counsellor/NGO ─┼─► React web app ──REST──► │ Auth          │ Profile (encrypted fields) │
 Admin ──┘     (Vite, Tailwind,        │ MATCH ENGINE  │ Schemes + admin (rules)    │
               Vercel)                 │ Tracker       │ Jobs (node-cron)           │
                  │                    └──────┬───────────────────────┬──────────────┘
          official link                       │ Mongoose              │ sends mail
                  ▼                           ▼                       ▼
        Official portals (NSP,         MongoDB Atlas            Email service
        state portals) — student       (10 collections,         (Resend / Brevo)
        applies here                    encrypted PII)
```

Fundora only hands students the official link; no form data or payment passes through it.

**Request flow for a match:** student saves profile → API bumps `profileVersion` → `GET /matches` prefilters schemes in MongoDB → engine evaluates rules → results cached and returned with reasons.

## 3. Tech stack and tools

| Layer | Tool | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite | Fast dev server and build |
| UI | Tailwind CSS + shadcn/ui | Accessible form controls, consistent styling |
| Routing / data | React Router, TanStack Query | Routing; API caching and loading states |
| Forms | React Hook Form + Zod | Multi-step profile wizard, shared validation |
| Backend | Node.js 20 + Express.js | REST APIs |
| ODM | Mongoose | Schemas and indexes |
| Database | MongoDB Atlas (M0 free) | Managed MongoDB, backups, Atlas Search |
| Auth | bcrypt + JWT in httpOnly cookies | Hashing, sessions, roles |
| Email | Resend or Brevo (+ React Email) | Verification, deadline and renewal reminders |
| Scheduled jobs | node-cron (v1), BullMQ + Upstash Redis (later) | Reminder sweep, link checks |
| Security | Zod, helmet, express-rate-limit, cors | Input checks, headers, abuse limits |
| Field encryption | Node crypto (AES-256-GCM) | Income, category, disability at rest |
| Charts | Recharts | Impact and counsellor dashboards |
| Testing | Vitest, Supertest, Playwright | Unit, API, end-to-end |
| API testing | Postman or Bruno | Manual endpoint checks |
| Code quality | ESLint, Prettier, Husky | Consistent code across the team |
| Version control / CI | GitHub + GitHub Actions | Lint, test, build on every PR |
| Hosting | Vercel (frontend), Render or Railway (backend) | Free tiers, auto-deploy |
| Monitoring | Sentry, UptimeRobot | Errors, uptime |
| Analytics | PostHog or Plausible | Sign-up → profile → official click funnel |
| Design | Figma | Wireframes |
| Project tracking | GitHub Projects or Notion | Sprint board |

TypeScript on both ends is recommended: profile and rule shapes are shared, and type errors there mean wrong eligibility results.

## 4. Data model

Ten MongoDB collections. Each scheme stores its eligibility rules as data, so admins add schemes without code changes.

| Collection | Holds | Key indexes |
| --- | --- | --- |
| users | email, passwordHash, role (student / counsellor / admin), verified, consent timestamp | email (unique) |
| profiles | userId, education level, course, year, marks/CGPA, attendance, family income (encrypted), category (encrypted), disability (encrypted), gender, state domicile, nationality, age, flags (first-gen, rural, orphan, single-parent, defence ward, minority), current scholarships, documents held, bank-Aadhaar seeded (yes/no), profileVersion | userId (unique) |
| schemes | name, provider, type, amount, deadline, courses, states, documents, steps, official URL, source URL, lastVerifiedAt, status, rules, renewal rules | type, deadline, states, courses, status; Atlas Search on name |
| applications | userId, schemeId, stage, notes, dates | userId + schemeId (unique) |
| matchResults | userId, profileVersion, schemeId, state, score, reasons | userId + profileVersion |
| notifications | userId, schemeId, kind (deadline / renewal), sendAt, sentAt | sendAt + sentAt |
| reports | schemeId, userId, field, message, status | status |
| organizations | counsellor/NGO name, members, linked students (with consent) | members |
| stories | success stories, mentor profiles, help-centre links | published |
| auditLogs | admin edits to schemes | schemeId |

**Never store** bank account numbers, Aadhaar numbers, or portal passwords. Store only yes/no flags.

**Scheme rule format** (values illustrate the format only):

```json
{
  "name": "Post-Matric Scholarship for SC Students",
  "type": "scholarship",
  "level": "UG",
  "courses": ["ALL"],
  "states": ["ALL"],
  "amount": { "max": 0, "period": "year", "text": "Tuition + maintenance" },
  "deadline": "2026-12-31",
  "officialUrl": "https://scholarships.gov.in",
  "lastVerifiedAt": "2026-10-20",
  "rules": [
    { "field": "category", "op": "in", "value": ["SC"], "hard": true },
    { "field": "familyIncome", "op": "lte", "value": 250000, "nearMargin": 50000 },
    { "field": "marksPercent", "op": "gte", "value": 50, "nearMargin": 5 }
  ],
  "renewal": { "minAttendance": 75, "minCgpa": 6 }
}
```

## 5. Eligibility engine

A pure function `evaluate(profile, scheme)` returns a state, a score and reasons.

1. **Prefilter in MongoDB** on indexed fields (level, course, state, active, deadline).
2. **Evaluate rules in Node**: each rule is pass, near (within `nearMargin`) or fail, with a plain-language reason.
3. **Decide the state**
   - Eligible: every rule passes.
   - Almost eligible: all hard rules pass and at most two soft rules are near-misses (income, marks, attendance, age).
   - Not eligible: a hard rule fails (category, gender, state, course, nationality, disability) or a soft rule misses beyond its margin.
4. **Score and sort**: share of rules passed + boosts for special-category schemes and nearer deadlines.
5. **Cache** in `matchResults` keyed by `profileVersion`; re-run on profile change or scheme edit.

Operators: `eq`, `in`, `notIn`, `lte`, `gte`, `between`, `exists`, `isTrue`. Unknown fields/operators are rejected at admin save time. Reason templates sit beside each operator. Unit-test every operator and every state boundary.

## 6. API design

All routes under `/api/v1`, JSON, Zod-validated, role-checked.

| Method | Route | Role | Does |
| --- | --- | --- | --- |
| POST | /auth/register | public | Create account, send verification email |
| POST | /auth/verify | public | Confirm email token |
| POST | /auth/login, /auth/logout | public / student | Set or clear session cookie |
| POST | /auth/forgot, /auth/reset | public | Password reset |
| GET / PUT | /profile | student | Read or save profile (partial saves) |
| GET | /matches | student | Eligibility results; filter and sort |
| GET | /schemes/:id | public | Opportunity page (+ student's result when logged in) |
| GET | /schemes | public | Browse and search |
| GET / POST / PATCH | /applications | student | Tracker |
| GET / PATCH | /notifications/settings | student | Reminder preferences |
| POST | /schemes/:id/report | student | Report wrong information |
| GET | /guides/:slug | public | NSP, Aadhaar-bank seeding, certificates |
| POST / PUT / DELETE | /admin/schemes | admin | Manage schemes; rules validated on save |
| GET / PATCH | /admin/reports | admin | Review reports |
| GET | /admin/stats | admin | Impact numbers |
| GET | /org/students | counsellor | Linked students and match summaries |

Log events: profile completed, matches viewed, scheme saved, official link clicked, stage → Applied / Awarded.

## 7. Frontend structure

| Area | Pages |
| --- | --- |
| Public | Landing, browse schemes, opportunity page, guides, success stories, login/register |
| Onboarding | Verify email, 5-step profile wizard (education; marks and attendance; family and income; category and background; documents held) |
| Student | Matches (Eligible / Almost / Not eligible tabs), filters, opportunity page with reasons, tracker board, reminder settings, profile edit |
| Counsellor | Student list, per-student match summary |
| Admin | Scheme list, scheme editor with rule builder + live preview, reports queue, impact dashboard |

```
fundora/
  apps/web/        React + Vite
  apps/api/        Express + Mongoose
  packages/shared/ Zod schemas, rule types, eligibility engine
  .github/workflows/
```

Mobile-first. English first, then Kannada and Hindi via react-i18next.

## 8. Security, privacy and trust

India's Digital Personal Data Protection Act 2023 applies; have the privacy notice reviewed before launch.

**Privacy**
- Explicit consent at sign-up; store consent timestamp
- AES-256-GCM encryption for income, category, disability; key in env vars
- Yes/no flags only for documents and bank seeding
- Account deletion removes profile, matches and tracker data
- Counsellors see a student only after the student accepts
- Impact dashboard shows aggregates only

**Security**
- bcrypt (cost 12); JWT in httpOnly, Secure, SameSite cookies
- helmet, CORS limited to frontend domain, rate limits on auth routes
- Zod on every request body; sanitise against Mongo operator injection
- Admins created by seed script only; audit log on every scheme edit

**Trust**
- Source link and last-verified date on every scheme; stale flag after 90 days
- Verified badge only for government and known foundation sources
- Scam warning: Fundora never charges fees or asks for passwords
- Weekly link-checker job
- Report-wrong-info → admin queue

## 9. Step-by-step build procedure

About 12 weeks for a three-person team, part-time.

### Phase 0 — Setup (week 1)
1. GitHub monorepo (npm workspaces or pnpm): `apps/web`, `apps/api`, `packages/shared`.
2. Frontend: `npm create vite@latest web -- --template react-ts`; add Tailwind, shadcn/ui, React Router, TanStack Query.
3. Backend: Express, Mongoose, Zod, helmet, cors, dotenv, tsx/nodemon.
4. MongoDB Atlas M0 cluster; `.env` + `.env.example`.
5. ESLint, Prettier, Husky; GitHub Actions for lint + tests.
6. Figma wireframes for 8 core screens.

Tools: Git, GitHub, Node 20, VS Code, Figma, MongoDB Atlas.

### Phase 1 — Authentication (week 2)
1. `users` model; register, verify, login, logout, forgot, reset routes.
2. bcrypt; JWT cookie; `requireAuth` and `requireRole` middleware.
3. Verification and reset emails via Resend/Brevo.
4. Register, login, verify pages; consent screen.
5. Rate limits; Supertest tests.

Tools: bcrypt, jsonwebtoken, Resend/Brevo, Supertest.

### Phase 2 — Student profile (weeks 2–3)
1. Profile Zod schema in `packages/shared`.
2. `profiles` model with encrypted fields.
3. `GET/PUT /profile` with partial saves.
4. 5-step wizard with progress bar and resume.

Tools: React Hook Form, Zod, Node crypto.

### Phase 3 — Scheme data and admin panel (weeks 3–5)
1. `schemes` model and rule format; validate on save.
2. Admin scheme list and editor with rule builder.
3. Seed: central schemes on the National Scholarship Portal (scholarships.gov.in), Karnataka SSP, AICTE schemes, major private foundations; then other states. Target 100 verified schemes before launch.
4. Source URL + last-verified date per scheme; verification log sheet.
5. Audit logs.

Tools: Mongoose, seed script, Google Sheets.

### Phase 4 — Eligibility engine (weeks 4–6)
1. `evaluate(profile, scheme)` in `packages/shared` with operators and reason templates.
2. Vitest for every operator and boundary.
3. `GET /matches`: prefilter → evaluate → score → sort → cache.
4. Cache invalidation on profile/scheme change.
5. Live preview in admin editor using the shared function.

Tools: Vitest, MongoDB indexes, `explain()`.

### Phase 5 — Discovery UI (weeks 6–7)
1. Matches page with three tabs and reasons.
2. Filters and sort synced to URL.
3. Opportunity page with checklist, steps, last-verified date, official link.
4. Guide pages (NSP, Aadhaar-bank seeding, certificates).
5. Public browse/search with Atlas Search.

Tools: TanStack Query, Atlas Search, Tailwind.

### Phase 6 — Tracker and reminders (weeks 7–8)
1. `applications` model and tracker board.
2. Notifications at 14, 7, 1 days before deadline when saved.
3. Daily node-cron job sends due emails.
4. Renewal reminders from attendance/CGPA rules.
5. Reminder settings + unsubscribe link.

Tools: node-cron, Resend/Brevo, React Email.

### Phase 7 — Trust features (week 9)
1. Verified badges, scam banner, report form, reports queue.
2. Weekly link checker; 90-day stale flag.
3. Account deletion and data export.

### Phase 8 — Dashboards and community (weeks 9–10)
1. Impact dashboard.
2. Counsellor/NGO dashboard with consent-based linking.
3. Success stories, mentor connect, help-centre links.

Tools: Recharts, MongoDB aggregation.

### Phase 9 — Testing and launch (weeks 11–12)
1. Playwright e2e: register → profile → matches → save → official link.
2. Lighthouse + axe; test on low-end Android, slow 3G.
3. Pilot with 30–50 BMSCE students.
4. Deploy: Vercel, Render/Railway, Atlas production; env vars; domain.
5. Sentry, UptimeRobot, analytics; Atlas backups.

Tools: Playwright, Lighthouse, axe DevTools, Vercel, Render/Railway, Sentry, UptimeRobot, PostHog.

### Phase 10 — v2: Internships
1. Internship opportunity type reusing the rule engine.
2. Profile: skills, projects, competitions, aspirations.
3. Resume builder (react-pdf).
4. Listings: virtual internships, summer programs, NGO/research, open source, campus ambassador.

## 10. Deployment, testing, costs and risks

**Environments:** local, staging (auto-deploy from `main`), production (tagged releases); separate Atlas databases and email keys.

**Testing targets**
- Engine: every operator and boundary
- API: every route incl. role checks (student → admin route = 403)
- E2E: full student path on every PR to `main`

**Costs (approximate)**

| Item | Cost |
| --- | --- |
| Atlas M0, Vercel Hobby, Render free, Sentry/UptimeRobot free | Rs. 0 |
| Email free tier | Rs. 0 |
| Domain | Rs. 500–1,000 / year |
| Later: Render paid + Atlas M10 | ~Rs. 2,000–5,000 / month |

Render's free instance sleeps when idle; upgrade before a wide launch. Check current free-tier limits.

**Risks**

| Risk | Mitigation |
| --- | --- |
| Stale or wrong scheme data | Last-verified dates, stale flags, link checker, report button, owner per state |
| Wrong "Eligible" result | Boundary tests, "verify on official site" note, pilot |
| Income/category data leak | Field encryption, minimal collection, no ID/bank numbers |
| Scams using the Fundora name | No-fees banner, official links only, verified badges |
| Data entry can't keep up | Launch Karnataka + central first; student volunteers per state |
