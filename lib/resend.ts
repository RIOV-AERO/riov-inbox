export const FROM_ADDRESS = process.env.FROM_EMAIL_ADDRESS || "inbox@riov.com.br";

export interface ResendAttachmentInput {
  filename: string;
  content: string; // base64, no data-URI prefix
}

export interface SendResendEmailInput {
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  attachments?: ResendAttachmentInput[];
}

export interface SendResendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendResendEmail(
  input: SendResendEmailInput,
): Promise<SendResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY não configurada" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: input.to,
      cc: input.cc?.length ? input.cc : undefined,
      subject: input.subject,
      text: input.text,
      attachments: input.attachments?.length ? input.attachments : undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: (body as { message?: string }).message ?? `Erro ${res.status}`,
    };
  }

  const body = (await res.json()) as { id: string };
  return { ok: true, id: body.id };
}
