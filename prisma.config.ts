import { config } from "dotenv";
// Next.js stores local secrets in .env.local — load it explicitly for Prisma CLI
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
