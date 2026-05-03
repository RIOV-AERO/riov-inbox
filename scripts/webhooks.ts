// scripts/webhooks.ts — list, inspect and manage Resend webhooks
// Usage:
//   pnpm webhooks:list
//   pnpm webhooks:get <id>
//   pnpm webhooks:create
//   pnpm webhooks:delete <id>

import { config } from "dotenv";
config({ path: ".env.local" });

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const BASE = "https://api.resend.com";

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, json);
    process.exit(1);
  }
  return json as T;
}

const [, , cmd, id] = process.argv;

async function main() {
  switch (cmd) {
    case "list": {
      const data = await req<{ data: unknown[] }>("GET", "/webhooks");
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "get": {
      if (!id) {
        console.error("Usage: pnpm webhooks:get <id>");
        process.exit(1);
      }
      const data = await req("GET", `/webhooks/${id}`);
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "create": {
      const data = await req("POST", "/webhooks", {
        url: "https://inbox.riov.com.br/api/webhooks/resend",
        events: ["email.received"],
      });
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "update": {
      if (!id) {
        console.error("Usage: pnpm webhooks:update <id>");
        process.exit(1);
      }
      const data = await req("PATCH", `/webhooks/${id}`, {
        events: ["email.received"],
      });
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "delete": {
      if (!id) {
        console.error("Usage: pnpm webhooks:delete <id>");
        process.exit(1);
      }
      await req("DELETE", `/webhooks/${id}`);
      console.log(`Deleted ${id}`);
      break;
    }

    default:
      console.log("Commands: list | get <id> | create | delete <id>");
  }
}

main();
