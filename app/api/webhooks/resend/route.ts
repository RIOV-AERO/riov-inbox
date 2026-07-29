import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import type {
  ResendWebhookEvent,
  AttachmentDownloadRecord,
  ResendReceivedEmailResponse,
  ResendReceivedEmailAttachmentDetails,
} from "./types";

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

  let event: ResendWebhookEvent;

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true });
  }

  const { data } = event;
  const from = data.from;
  const to = data.to.join(", ");
  const messageId = data.message_id;

  if (messageId) {
    try {
      const existing = await prisma.email.findUnique({
        where: { messageId },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ received: true });
      }
    } catch (error) {
      console.error("[webhook] failed to check for existing email:", error);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "[webhook] RESEND_API_KEY is not configured. Cannot retrieve email body or attachments.",
    );
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 },
    );
  }

  // 1. Retrieve full received email details to get the html/text bodies and full attachments list
  let emailDetail: ResendReceivedEmailResponse;
  try {
    console.log(
      `[webhook] Fetching received email details for ID: ${data.email_id}`,
    );
    const res = await fetch(
      `https://api.resend.com/emails/receiving/${data.email_id}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `[webhook] Failed to fetch received email ${data.email_id}: ${res.status} ${errText}`,
      );
      return NextResponse.json(
        { error: "Failed to retrieve email details from Resend" },
        { status: 500 },
      );
    }
    emailDetail = (await res.json()) as ResendReceivedEmailResponse;
  } catch (error) {
    console.error(
      `[webhook] Error fetching received email ${data.email_id}:`,
      error,
    );
    return NextResponse.json(
      { error: "Internal server error fetching email details" },
      { status: 500 },
    );
  }

  // 2. Query each attachment endpoint to get its signed CDN download_url and fetch its binary content
  const attachmentRecords: AttachmentDownloadRecord[] = [];

  if (emailDetail.attachments && Array.isArray(emailDetail.attachments)) {
    for (const att of emailDetail.attachments) {
      try {
        console.log(
          `[webhook] Fetching details for attachment ${att.id} of email ${data.email_id}`,
        );
        const attRes = await fetch(
          `https://api.resend.com/emails/receiving/${data.email_id}/attachments/${att.id}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!attRes.ok) {
          console.error(
            `[webhook] Failed to fetch details for attachment ${att.id}: ${attRes.statusText}`,
          );
          continue;
        }
        const attDetails =
          (await attRes.json()) as ResendReceivedEmailAttachmentDetails;
        const downloadUrl = attDetails.download_url;

        console.log(
          `[webhook] Downloading attachment file from ${downloadUrl}`,
        );
        const fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) {
          console.error(
            `[webhook] Failed to download attachment file from ${downloadUrl}: ${fileRes.statusText}`,
          );
          continue;
        }
        const arrayBuffer = await fileRes.arrayBuffer();
        const content = new Uint8Array(arrayBuffer);

        attachmentRecords.push({
          filename: att.filename,
          contentType: att.content_type,
          size: att.size,
          content,
          url: downloadUrl,
        });
      } catch (err) {
        console.error(`[webhook] Error downloading attachment ${att.id}:`, err);
      }
    }
  }

  try {
    await prisma.email.create({
      data: {
        messageId,
        from: emailDetail.from || from,
        to: Array.isArray(emailDetail.to) ? emailDetail.to.join(", ") : to,
        subject: emailDetail.subject || data.subject || "(no subject)",
        html: emailDetail.html,
        text: emailDetail.text,
        attachments: {
          create: attachmentRecords.map((rec) => ({
            filename: rec.filename,
            contentType: rec.contentType,
            size: rec.size,
            content: rec.content as any,
            url: rec.url,
          })),
        },
      },
    });
  } catch (error) {
    console.error("[webhook] failed to store email:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
