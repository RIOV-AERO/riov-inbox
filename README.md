# riov-inbox

Email inbox for `inbox.riov.com.br`. Receives emails via Resend, stores them in Postgres, shows them in a simple UI.

```mermaid
flowchart LR
    email([someone sends an email])
    resend[Resend]
    webhook[POST /api/webhooks/resend]
    db[(Postgres)]
    ui[inbox.riov.com.br]

    email --> resend --> webhook --> db --> ui
```

## run

```bash
pnpm install
pnpm dev
```

Needs `.env.local` — copy from `.env.example`.
