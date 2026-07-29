"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type ChangePasswordState } from "../actions";

const initial: ChangePasswordState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {state.error && (
        <div className="rounded-riov-md border border-danger-border bg-danger-tint px-3.5 py-2 text-[13px] font-medium text-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-riov-md border border-accent-tint-border bg-accent-tint px-3.5 py-2 text-[13px] font-medium text-accent-deep">
          Senha atualizada.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="currentPassword"
          type="password"
          required
          placeholder="Senha atual"
          autoComplete="current-password"
          className="rounded-riov-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
        <input
          name="newPassword"
          type="password"
          required
          placeholder="Nova senha"
          autoComplete="new-password"
          className="rounded-riov-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="Confirmar nova senha"
          autoComplete="new-password"
          className="rounded-riov-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink-secondary hover:border-border-strong disabled:opacity-60"
      >
        {pending ? "Atualizando…" : "Atualizar senha"}
      </button>
    </form>
  );
}
