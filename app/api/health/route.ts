import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // 1. Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (e) {
    checks.database = { ok: false, detail: String(e) };
  }

  // 2. Webhook secret configured
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  checks.webhook_secret = {
    ok: Boolean(secret && secret.startsWith("whsec_")),
    detail: secret ? "present" : "missing",
  };

  // 3. Email count (proves DB has the right schema)
  try {
    const count = await prisma.email.count();
    checks.email_table = { ok: true, detail: `${count} emails` };
  } catch (e) {
    checks.email_table = { ok: false, detail: String(e) };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checks,
      webhook_endpoint: "https://inbox.riov.com.br/api/webhooks/resend",
      webhook_event: "inbound.email",
    },
    { status: allOk ? 200 : 503 },
  );
}
