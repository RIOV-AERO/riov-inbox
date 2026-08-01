import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildUserEmailScope } from "@/lib/user-emails";
import { prisma } from "@/lib/prisma";
import { parseSender } from "@/lib/format";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam
    ? new Date(Number(sinceParam))
    : new Date(Date.now() - 60000);

  const userScope = await buildUserEmailScope(user);

  const newEmails = await prisma.email.findMany({
    where: {
      direction: "INBOUND",
      archived: false,
      deletedAt: null,
      receivedAt: { gt: since },
      AND: [userScope],
    },
    orderBy: { receivedAt: "desc" },
    take: 5,
    select: {
      id: true,
      from: true,
      subject: true,
      receivedAt: true,
    },
  });

  const formatted = newEmails.map((e) => {
    const { name } = parseSender(e.from);
    return {
      id: e.id,
      senderName: name || e.from,
      subject: e.subject || "(Sem assunto)",
      receivedAt: e.receivedAt.getTime(),
    };
  });

  return NextResponse.json({
    timestamp: Date.now(),
    emails: formatted,
  });
}
