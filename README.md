# riov-inbox

Email inbox for Riov. Receives inbound emails via Resend webhook and displays them at [inbox.riov.com.br](https://inbox.riov.com.br).

```mermaid
graph LR
    A[email arrives] --> B[Resend]
    B -->|POST inbound.email| C[/api/webhooks/resend]
    C --> D[(Prisma Postgres)]
    D --> E[/inbox]
    E --> F[/inbox/:id]
```

## run

```bash
pnpm install
pnpm db:generate
pnpm dev
```

Copy `.env.example` → `.env.local` and fill in `DATABASE_URL` and `RESEND_WEBHOOK_SECRET`.
