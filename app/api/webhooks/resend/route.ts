import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (secret) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "missing svix headers" },
        { status: 400 },
      );
    }

    try {
      const wh = new Webhook(secret);
      wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  let event: {
    type: string;
    data: {
      message_id?: string;
      from?: string;
      to?: string | string[];
      subject?: string;
      html?: string;
      text?: string;
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true });
  }

  const { data } = event;
  const from = data.from ?? "";
  const to = Array.isArray(data.to) ? data.to.join(", ") : (data.to ?? "");
  const messageId = data.message_id ?? null;

  try {
    if (messageId) {
      await prisma.email.upsert({
        where: { messageId },
        update: {},
        create: {
          messageId,
          from,
          to,
          subject: data.subject ?? "(sem assunto)",
          html: data.html ?? null,
          text: data.text ?? null,
        },
      });
    } else {
      await prisma.email.create({
        data: {
          from,
          to,
          subject: data.subject ?? "(sem assunto)",
          html: data.html ?? null,
          text: data.text ?? null,
        },
      });
    }
  } catch (error) {
    console.error("[webhook] failed to store email:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
