"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "../actions";

const initial: ProfileState = {};

export function ProfileForm({
  name,
  email,
  signature,
}: {
  name: string;
  email: string;
  signature: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-riov-md border border-danger-border bg-danger-tint px-3.5 py-2 text-[13px] font-medium text-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-riov-md border border-accent-tint-border bg-accent-tint px-3.5 py-2 text-[13px] font-medium text-accent-deep">
          Alterações salvas.
        </div>
      )}

      <div className="flex items-center gap-3.5 rounded-riov-lg border border-border-subtle p-4">
        <span className="flex size-10.5 shrink-0 items-center justify-center rounded-riov-md bg-ink text-[15px] font-semibold text-white">
          {name[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <input
            name="name"
            defaultValue={name}
            required
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
          />
          <div className="truncate text-[13px] text-ink-muted">{email}</div>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Assinatura</span>
        <span className="text-[12.5px] text-ink-muted">
          Anexada ao final de cada mensagem enviada.
        </span>
        <textarea
          name="signature"
          defaultValue={signature}
          rows={3}
          placeholder="— Seu nome&#10;Cargo · RIOV"
          className="mt-1.5 resize-y rounded-riov-md border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
