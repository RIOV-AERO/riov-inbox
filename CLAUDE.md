# `riov-inbox` — Email Inbox

Centralized email inbox of the company. Receives emails via Resend webhook and displays them in a simple UI, behind a fully custom JWT-based login. Before modifying anything, read the root `CLAUDE.md` (`/riov/CLAUDE.md`).

## Domain

**`inbox.riov.com.br`** — production domain.

Webhook URL (Resend → inbound): `https://inbox.riov.com.br/api/webhooks/resend`

## Language Rule

**All UI-facing text must be in Portuguese.** Back-end logic, API endpoints, JSON responses, comments, and variable names must be in English. No Portuguese is permitted in back-end codes.

## Stack

- **Next.js 16** + **App Router** + **strict TypeScript**.
- **React 19**.
- **Tailwind 4** — CSS-first config via `@theme` in `app/globals.css`. **Do NOT create `tailwind.config.js`**.
- **Prisma 7** — new `prisma-client` generator, requires `@prisma/adapter-pg` driver adapter. Config lives in `prisma.config.ts` (not in schema). Generated client at `lib/generated/prisma/client/client.ts`.
- **PostgreSQL** — hosted on Prisma Platform (`db.prisma.io`). Connection string in `.env.local`.
- **zod** — validates every server action / form input (`lib/validations/*`).
- **jose** + **bcryptjs** — fully custom JWT auth (no NextAuth/Clerk/Auth0). See "Auth" below.
- **lucide-react** — the only icon library. No hand-rolled SVGs in new code.
- **svix** — webhook signature verification for Resend inbound events.
- **pnpm** — package manager. Never npm or yarn.

## Layout

```
riov-inbox/
├── package.json
├── tsconfig.json
├── next.config.ts
├── proxy.ts                     # route guard (Next 16 renamed "middleware" → "proxy")
├── postcss.config.mjs           # @tailwindcss/postcss plugin
├── prisma.config.ts             # Prisma 7 CLI config (schema path + datasource URL)
├── prisma/
│   └── schema.prisma            # Email/Attachment/Label/User/Session — push with `pnpm db:push`
├── lib/
│   ├── prisma.ts                # Singleton PrismaClient with PrismaPg adapter
│   ├── auth/                    # jwt.ts, session.ts, password.ts, actions.ts (logout), constants.ts
│   ├── validations/             # zod schemas: auth.ts, compose.ts, settings.ts
│   ├── email-query.ts           # shared Prisma where-builder + list select for inbox/sent/archived/trash
│   ├── format.ts                # date/bytes/sender formatting (pt-BR)
│   ├── avatar.ts, attachment-style.ts
│   ├── resend.ts                # outbound send helper (used by compose)
│   └── generated/                # ← gitignored, produced by `pnpm db:generate`
│       └── prisma/client/
│           └── client.ts        # generated Prisma client entry point
├── components/
│   ├── layout/                  # Sidebar, PageHeader, FolderHeader, sidebar-context
│   ├── inbox/                   # EmailList, EmailListRow, SearchBar, FilterChips, AttachmentCard, ...
│   ├── compose/                 # compose-context, ComposeWindow (floating, bottom-right)
│   ├── toast/                   # toast-context, ToastStack
│   └── providers/AppProviders.tsx
└── app/
    ├── globals.css               # @import "tailwindcss" + @theme (warm light palette, see Design System)
    ├── layout.tsx                # metadataBase = https://inbox.riov.com.br, Inter via next/font
    ├── page.tsx                  # redirect → /inbox
    ├── login/                    # public — email/password form, no public sign-up
    ├── (app)/                    # everything behind auth; layout.tsx calls requireUser()
    │   ├── layout.tsx            # sidebar shell + AppProviders (toast/compose/sidebar-drawer)
    │   ├── email-actions.ts      # archive/unarchive/trash/restore/markRead — shared across folders
    │   ├── compose/actions.ts    # sendComposeAction — sends via Resend, persists OUTBOUND Email
    │   ├── inbox/page.tsx        # list — search + filter chips + day grouping
    │   ├── inbox/[id]/page.tsx   # detail — marks as read, sandboxed HTML iframe or plain-text pre
    │   ├── sent/, archived/, trash/page.tsx
    │   └── settings/             # profile, password change, density/notifications/signature
    └── api/
        ├── attachments/[attachmentId]/route.ts  # GET handler: fetches attachment blob, serves download
        └── webhooks/resend/
            ├── route.ts          # POST handler: verifies svix sig, stores Email record (INBOUND)
            └── types.ts          # Type definitions for the webhook payload
```

## Auth

Fully custom — no third-party auth library.

- **Password hashing:** `bcryptjs` (pure JS — works across different JS runtimes; native `bcrypt` bindings would not).
- **Session token:** a single JWT (HS256, signed with `jose`, secret = `AUTH_SECRET`) stored in an httpOnly `riov_session` cookie, 30-day expiry. Claims: `sub` (user id), `sid` (Session row id), `email`, `name`.
- **Revocation:** each login creates a `Session` row. `lib/auth/session.ts#getCurrentUser()` verifies the JWT signature _and_ confirms the `Session` row still exists — this is what makes logout actually take effect before the JWT's own expiry, not just signature/exp checks.
- **`proxy.ts`** (Next's renamed middleware convention) does a fast, stateless check — signature + expiry only, no DB — to redirect unauthenticated requests to `/login`. The authoritative, DB-backed check lives in `requireUser()` / `getCurrentUser()`, used by `app/(app)/layout.tsx` and every server action that mutates data.
- **No public sign-up.** This is a shared company inbox, not a multi-tenant product. Accounts are provisioned with `pnpm user:create <email> <password> <name>` (`scripts/create-user.ts`).
- Password change, name, and signature are editable from `/settings` (all server actions, zod-validated).

**Gotcha:** any script that imports `lib/prisma.ts` (or anything importing it) needs env vars loaded _before_ module evaluation — ESM hoists `import` statements above plain statements, so a `dotenv`-then-`config()` pattern in the script itself runs too late. Use `tsx --env-file=.env.local` (see the `user:create` / `db:seed-labels` package.json scripts), not the `dotenv` package, for any one-off script that touches the database.

## Database

**Schema** (`prisma/schema.prisma`) — five models: `User`, `Session`, `Label`, `Email`, `Attachment`.

- `Email.direction` (`INBOUND` | `OUTBOUND`) distinguishes received mail from mail sent through the compose window — both live in the same table so a thread's reply history is trivial to query later.
- `Email.archived` + `Email.deletedAt` back the Archived/Trash folders. There is **no scheduled sweep** that actually purges trash after 30 days yet — the UI copy states the policy, enforcement is a follow-up.
- `Label` has an implicit many-to-many with `Email` (Prisma manages the join table).
- `User` carries per-account preferences (`density`, `loadExternalImages`, `desktopNotifications`, `signature`) alongside auth fields. **`loadExternalImages` is stored but not yet enforced** — the HTML iframe doesn't currently strip remote images when it's off.

**Commands:**

```bash
pnpm db:generate      # regenerate Prisma client after schema changes
pnpm db:push          # push schema to Prisma Postgres (no migration files)
pnpm db:studio        # open Prisma Studio
pnpm db:seed-labels   # seed the default Clientes/Financeiro/Produto labels
pnpm user:create <email> <password> <name>  # provision a login
```

**Prisma 7 rules:**

- `url` is NOT in the `datasource` block of `schema.prisma` — it lives in `prisma.config.ts`.
- Generator must be `provider = "prisma-client"` (not `prisma-client-js`) with an explicit `output`.
- `PrismaClient` must be instantiated with `new PrismaPg(pool)` adapter (using a globally cached `pg.Pool` with connection pooling settings like `max: 2` to prevent connection exhaustion) — no Rust engine.
- Import from `./generated/prisma/client/client`, not `@prisma/client`.

## Webhook (Resend)

- **Endpoint:** `POST /api/webhooks/resend`
- **Event to subscribe:** `inbound.email`
- **Signature:** svix headers (`svix-id`, `svix-timestamp`, `svix-signature`). Set `RESEND_WEBHOOK_SECRET` in `.env.local`.
- If `RESEND_WEBHOOK_SECRET` is empty the handler skips verification (useful for local dev with ngrok).
- Idempotent: uses `upsert` on `messageId` to avoid duplicate storage.
- Stored emails default to `direction: INBOUND` (schema default) — this route never needs to set it explicitly.
- Exempted from the auth proxy (`proxy.ts` allow-lists `/api/webhooks` and `/api/health`) since Resend calls it directly, with no session cookie.

## Design System

Warm, light theme (this superseded the earlier dark `rio-*` palette — see `app/globals.css` `@theme` block, tokens below are the source of truth):

| Token                                      | Value                             | Use                                                |
| ------------------------------------------ | --------------------------------- | -------------------------------------------------- |
| `--color-page`                             | `#F7F6F3`                         | app background                                     |
| `--color-surface`                          | `#FFFFFF`                         | cards, sidebar, header                             |
| `--color-ink`                              | `#17201C`                         | primary text                                       |
| `--color-ink-secondary`                    | `#6B7671`                         | secondary text                                     |
| `--color-ink-muted`                        | `#8A948E`                         | tertiary text / icons                              |
| `--color-border` / `-strong` / `-subtle`   | `#E7E4DE` / `#E0DCD4` / `#F0EEE9` | dividers, card borders                             |
| `--color-accent`                           | `#00A86B`                         | the **only** accent — CTAs, unread dot, focus ring |
| `--color-accent-hover` / `-deep` / `-tint` | `#00875A` / `#00694A` / `#E6F6EF` | accent variants                                    |
| `--color-danger` / `-tint`                 | `#B4402F` / `#FDF4F2`             | destructive actions                                |

- `font-sans` (Inter, via `next/font/google`) everywhere — no more `font-mono` on pages.
- Radii: `rounded-riov-sm/md/lg/xl` (8/12/14/20px), pills (`rounded-full`) for buttons/chips/badges.
- No UI component library — raw Tailwind utilities only. Icons from `lucide-react` only.
- Unread state is never color-only: 3px accent left border + tinted row background + semibold text + a small accent dot, together.

## Patterns

- **Server Components by default.** Use `"use client"` only when hooks/events are needed.
- **No state library.** React context (`components/{toast,compose,layout}/*-context.tsx`) covers the app-wide UI state (toasts, the floating compose window, the mobile sidebar drawer).
- **No TanStack Query / SWR.** Plain `fetch` or direct Prisma calls in Server Components.
- **Strict TypeScript.** No `any`.
- **zod at every boundary.** Server actions parse `FormData` through a schema in `lib/validations/` before touching Prisma.
- **No dependencies without justification.**
- **Separation of Types and Logic:** Keep type definitions (especially complex ones like webhook payloads, action inputs, and API responses) in a separate `types.ts` file in the same directory as the route or server file. Do not mix execution logic with heavy type definitions.
- **Server actions over API routes** for mutations (`email-actions.ts`, `compose/actions.ts`, `settings/actions.ts`, `login/actions.ts`) — API routes are reserved for the Resend webhook, attachment downloads, and health check, i.e. things an external caller or `<a download>` hits directly.

## Environment Variables

| Variable                         | Required    | Description                                                                                               |
| -------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | ✓           | Prisma Postgres connection string                                                                         |
| `AUTH_SECRET`                    | ✓           | HS256 signing secret for session JWTs (`openssl rand -base64 32`). Rotating it invalidates every session. |
| `RESEND_API_KEY`                 | ✓           | Resend API key, used for both inbound retrieval and outbound send                                         |
| `RESEND_WEBHOOK_SECRET`          | recommended | svix signing secret (`whsec_...`) from Resend dashboard                                                   |
| `FROM_EMAIL_ADDRESS`             | recommended | outgoing "From" address (defaults to `inbox@riov.com.br`)                                                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | recommended | Cloudflare Turnstile public site key for anti-bot / DDoS protection widget in login form                  |
| `TURNSTILE_SECRET_KEY`           | recommended | Cloudflare Turnstile private secret key for server-side siteverify API token validation                   |

## How to Run

```bash
pnpm dev        # development server
pnpm build      # production build (runs `prisma generate` first)
pnpm start      # start production server
```

For local webhook testing, expose port 3000 with ngrok:

```bash
ngrok http 3000
# use the https://xxx.ngrok-free.app/api/webhooks/resend URL in Resend dashboard
```
