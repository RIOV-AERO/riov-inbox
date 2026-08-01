/**
 * Cloudflare Turnstile Server-Side Verification Helper
 *
 * Cloudflare Turnstile verifies that incoming authentication requests (such as login)
 * originate from a real human browser rather than automated bot networks or DDoS scripts.
 *
 * Verification happens BEFORE querying the database or invoking computationally expensive
 * functions like bcrypt password hashing.
 *
 * Environment variables:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Exposed to the browser to render the Turnstile widget.
 * - TURNSTILE_SECRET_KEY: Kept secret on the server to verify tokens with Cloudflare's API.
 *
 * If TURNSTILE_SECRET_KEY is not configured (e.g., in local dev before setting up Cloudflare),
 * token verification is gracefully bypassed with a warning to avoid breaking development workflows.
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In local dev without keys configured, warn and bypass to prevent blocking developer iteration
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Turnstile] TURNSTILE_SECRET_KEY is missing. Skipping bot verification in development mode.",
      );
      return { success: true };
    }
    return {
      success: false,
      error: "Verificação de bot não configurada no servidor.",
    };
  }

  if (!token) {
    return {
      success: false,
      error: "Por favor, complete a verificação de segurança (Turnstile).",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
    );

    if (!res.ok) {
      console.error(
        "[Turnstile] Failed to communicate with Cloudflare siteverify endpoint:",
        res.status,
      );
      return {
        success: false,
        error: "Falha ao comunicar com o serviço de verificação de segurança.",
      };
    }

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      console.warn(
        "[Turnstile] Verification failed for token:",
        data["error-codes"],
      );
      return {
        success: false,
        error: "Verificação de segurança falhou. Por favor, tente novamente.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[Turnstile] Error verifying Turnstile token:", err);
    return {
      success: false,
      error: "Erro inesperado ao validar verificação de segurança.",
    };
  }
}
