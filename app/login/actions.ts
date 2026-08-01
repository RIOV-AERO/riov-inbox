"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    turnstileToken:
      (formData.get("cf-turnstile-response") as string | null) ??
      (formData.get("turnstileToken") as string | null),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { email, password, turnstileToken } = parsed.data;

  // 1. Validate Cloudflare Turnstile token BEFORE touching the database or running bcrypt.
  // This prevents bot networks and hackers from exhausting server CPU (bcrypt) or DB connections.
  const reqHeaders = await headers();
  const clientIp = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!turnstileResult.success) {
    return {
      error: turnstileResult.error ?? "Verificação de segurança falhou.",
    };
  }

  // 2. Query user from database
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Same generic message whether the email doesn't exist or the password is
  // wrong — don't leak which accounts exist.
  const invalidMessage = "E-mail ou senha incorretos";

  if (!user) return { error: invalidMessage };

  // 3. Verify bcrypt password hash
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: invalidMessage };

  await createSession(user.id);
  redirect("/inbox");
}
