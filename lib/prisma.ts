import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getConnectionString(): string {
  let url = process.env.DATABASE_URL || "";
  // Replace sslmode=require, sslmode=prefer, or sslmode=verify-ca with sslmode=verify-full
  // to avoid pg-connection-string security warnings and adhere to Postgres standards.
  if (url.includes("sslmode=require")) {
    url = url.replace("sslmode=require", "sslmode=verify-full");
  } else if (url.includes("sslmode=prefer")) {
    url = url.replace("sslmode=prefer", "sslmode=verify-full");
  } else if (url.includes("sslmode=verify-ca")) {
    url = url.replace("sslmode=verify-ca", "sslmode=verify-full");
  }
  return url;
}

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString: getConnectionString(),
    max: parseInt(process.env.DB_POOL_MAX || "2", 10),
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(globalForPrisma.pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const pool = globalForPrisma.pool;
export const prisma = globalForPrisma.prisma;
