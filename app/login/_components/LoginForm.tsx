"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-riov-lg border border-danger-border bg-danger-tint px-4 py-2.5 text-sm font-medium text-danger">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-ink-secondary">
            E-mail
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@riov.com.br"
            className="rounded-riov-md border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-ink-secondary">
            Senha
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="rounded-riov-md border border-border bg-surface px-3.5 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11.5 items-center justify-center rounded-full bg-accent text-[14.5px] font-semibold text-white shadow-riov-cta transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
