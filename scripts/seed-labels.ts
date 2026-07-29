// scripts/seed-labels.ts — seed the default label set shown in the mock
// Usage: pnpm db:seed-labels
//
// Run via `tsx --env-file=.env.local` rather than the `dotenv` package —
// see the comment in create-user.ts for why.

import { prisma } from "../lib/prisma";

const LABELS = [
  { slug: "clientes", name: "Clientes", color: "#00A86B" },
  { slug: "financeiro", name: "Financeiro", color: "#E8A33D" },
  { slug: "produto", name: "Produto", color: "#7A8CF0" },
];

async function main() {
  for (const label of LABELS) {
    await prisma.label.upsert({
      where: { slug: label.slug },
      update: { name: label.name, color: label.color },
      create: label,
    });
  }
  console.log("Labels seeded:", LABELS.map((l) => l.name).join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
