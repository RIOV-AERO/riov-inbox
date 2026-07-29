"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { composeSchema } from "@/lib/validations/compose";
import { sendResendEmail, type ResendAttachmentInput } from "@/lib/resend";

export type SendComposeState = {
  error?: string;
  success?: boolean;
  sentTo?: string;
};

const MAX_ATTACHMENTS_BYTES = 10 * 1024 * 1024;

export async function sendComposeAction(
  _prev: SendComposeState,
  formData: FormData,
): Promise<SendComposeState> {
  const user = await requireUser();

  const parsed = composeSchema.safeParse({
    to: formData.get("to"),
    cc: formData.get("cc") ?? "",
    subject: formData.get("subject"),
    body: formData.get("body"),
    replyToEmailId: formData.get("replyToEmailId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { to, cc, subject, body } = parsed.data;

  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_ATTACHMENTS_BYTES) {
    return { error: "Anexos excedem o limite de 10 MB no total" };
  }

  const attachmentBuffers = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    })),
  );

  const resendAttachments: ResendAttachmentInput[] = attachmentBuffers.map(
    (att) => ({
      filename: att.filename,
      content: att.buffer.toString("base64"),
    }),
  );

  const fullBody = user.signature ? `${body}\n\n${user.signature}` : body;

  const result = await sendResendEmail({
    to,
    cc,
    subject,
    text: fullBody,
    attachments: resendAttachments,
  });

  if (!result.ok) {
    return { error: result.error ?? "Não foi possível enviar" };
  }

  await prisma.email.create({
    data: {
      messageId: result.id,
      direction: "OUTBOUND",
      from: user.email,
      to: [...to, ...(cc ?? [])].join(", "),
      subject,
      text: fullBody,
      read: true,
      attachments: {
        create: attachmentBuffers.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
          content: att.buffer,
        })),
      },
    },
  });

  revalidatePath("/inbox");
  revalidatePath("/sent");

  return { success: true, sentTo: to[0] };
}
