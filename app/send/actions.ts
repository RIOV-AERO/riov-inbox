"use server";

export type SendState = { error?: string; success?: boolean };

export async function sendEmail(
  _prev: SendState,
  form: FormData,
): Promise<SendState> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "RESEND_API_KEY not configured" };

  const from = (form.get("from") as string)?.trim();
  const to = (form.get("to") as string)?.trim();
  const subject = (form.get("subject") as string)?.trim();
  const body = (form.get("body") as string)?.trim();

  if (!from || !to || !subject || !body) {
    return { error: "todos os campos são obrigatórios" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text: body }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: (err as { message?: string }).message ?? `erro ${res.status}` };
  }

  return { success: true };
}
