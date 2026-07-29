// scripts/create-user.ts — create or update a RIOV Inbox account
// Usage:
//   pnpm user:create <email> <password> <name>
//
// There is no public sign-up screen by design — this is a shared company
// inbox, not a multi-tenant product, so accounts are provisioned by whoever
// controls the server/deploy.
//
// Run via `tsx --env-file=.env.local` (see the "user:create" package.json
// script) rather than the `dotenv` package: dotenv's `config()` call runs
// too late to matter here, because ESM hoists `import { prisma } from
// "../lib/prisma"` — which reads DATABASE_URL at module-evaluation time —
// above any plain statement in this file, env-loading included.

import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  const name = nameParts.join(" ");

  if (!email || !password || !name) {
    console.error("Usage: pnpm user:create <email> <password> <name>");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
    select: { id: true, email: true, name: true },
  });

  console.log("User ready:", user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
