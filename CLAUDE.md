# `riov-inbox` — Email Inbox

Caixa de entrada centralizada da empresa. Recebe emails via webhook do Resend e os exibe em uma UI simples. Antes de modificar qualquer coisa, leia o `CLAUDE.md` da raiz (`/riov/CLAUDE.md`).

## Domínio

**`inbox.riov.com.br`** — domínio de produção.

Webhook URL (Resend → inbound): `https://inbox.riov.com.br/api/webhooks/resend`

## Language Rule

**All UI-facing text must be in Portuguese.** Code, comments, and variable names are English.

## Stack

- **Next.js 16** + **App Router** + **strict TypeScript**.
- **React 19**.
- **Tailwind 4** — CSS-first config via `@theme` in `app/globals.css`. **Do NOT create `tailwind.config.js`**.
- **Prisma 7** — new `prisma-client` generator, requires `@prisma/adapter-pg` driver adapter. Config lives in `prisma.config.ts` (not in schema). Generated client at `lib/generated/prisma/client/client.ts`.
- **PostgreSQL** — hosted on Prisma Platform (`db.prisma.io`). Connection string in `.env.local`.
- **svix** — webhook signature verification for Resend inbound events.
- **pnpm** — package manager. Never npm or yarn.

## Layout

```
riov-inbox/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs          # @tailwindcss/postcss plugin
├── prisma.config.ts            # Prisma 7 CLI config (schema path + datasource URL)
├── prisma/
│   └── schema.prisma           # Email model — push with `pnpm db:push`
├── lib/
│   ├── prisma.ts               # Singleton PrismaClient with PrismaPg adapter
│   └── generated/              # ← gitignored, produced by `pnpm db:generate`
│       └── prisma/client/
│           └── client.ts       # generated Prisma client entry point
└── app/
    ├── globals.css             # @import "tailwindcss" + @theme (matches GCS colors)
    ├── layout.tsx              # metadataBase = https://inbox.riov.com.br
    ├── page.tsx                # redirect → /inbox
    ├── inbox/
    │   ├── page.tsx            # email list (server component, force-dynamic)
    │   └── [id]/
    │       └── page.tsx        # email detail — marks as read, renders HTML in sandboxed iframe
    └── api/
        └── webhooks/
            └── resend/
                └── route.ts    # POST handler: verifies svix sig, stores Email record
```

## Database

**Schema** (`prisma/schema.prisma`):

```prisma
model Email {
  id         String   @id @default(cuid())
  messageId  String?  @unique
  from       String
  to         String
  subject    String
  html       String?
  text       String?
  read       Boolean  @default(false)
  receivedAt DateTime @default(now())
  createdAt  DateTime @default(now())
}
```

**Commands:**

```bash
pnpm db:generate   # regenerate Prisma client after schema changes
pnpm db:push       # push schema to Prisma Postgres (no migration files)
pnpm db:studio     # open Prisma Studio
```

**Prisma 7 rules:**

- `url` is NOT in the `datasource` block of `schema.prisma` — it lives in `prisma.config.ts`.
- Generator must be `provider = "prisma-client"` (not `prisma-client-js`) with an explicit `output`.
- `PrismaClient` must be instantiated with `new PrismaPg({ connectionString })` adapter — no Rust engine.
- Import from `./generated/prisma/client/client`, not `@prisma/client`.

## Webhook (Resend)

- **Endpoint:** `POST /api/webhooks/resend`
- **Event to subscribe:** `inbound.email`
- **Signature:** svix headers (`svix-id`, `svix-timestamp`, `svix-signature`). Set `RESEND_WEBHOOK_SECRET` in `.env.local`.
- If `RESEND_WEBHOOK_SECRET` is empty the handler skips verification (useful for local dev with ngrok).
- Idempotent: uses `upsert` on `messageId` to avoid duplicate storage.

## Design System

Identical to `riov-gcs/web`. Dark theme only:

| Token       | Value                  |
| ----------- | ---------------------- |
| `rio-green` | `oklch(0.55 0.15 145)` |
| `rio-bg`    | `oklch(0.16 0.02 240)` |
| `rio-fg`    | `oklch(0.96 0.01 240)` |

- `font-mono` on all pages.
- `zinc-900`/`zinc-950` backgrounds; `zinc-400`/`zinc-500` secondary text.
- `rio-green` for interactive accents, focus rings, unread indicators.
- `rose-*` for errors. `amber-*` for warnings.
- No UI component library — raw Tailwind utilities only.
- Borders: `border-zinc-800` on containers, `border-rio-green` on focus/hover.

## Patterns

- **Server Components by default.** Use `"use client"` only when hooks/events are needed.
- **No state library.** `useState`/`useReducer` is enough.
- **No TanStack Query / SWR.** Plain `fetch` or direct Prisma calls in Server Components.
- **Strict TypeScript.** No `any`.
- **No dependencies without justification.**

## Environment Variables

| Variable                | Required    | Description                                             |
| ----------------------- | ----------- | ------------------------------------------------------- |
| `DATABASE_URL`          | ✓           | Prisma Postgres connection string                       |
| `RESEND_WEBHOOK_SECRET` | recommended | svix signing secret (`whsec_...`) from Resend dashboard |

## How to Run

```bash
pnpm dev        # development server
pnpm build      # production build
pnpm start      # start production server
```

For local webhook testing, expose port 3000 with ngrok:

```bash
ngrok http 3000
# use the https://xxx.ngrok-free.app/api/webhooks/resend URL in Resend dashboard
```
