"use client";

import { useActionState } from "react";
import { sendEmail, SendState } from "../actions";

const initial: SendState = {};

export default function ComposeForm() {
  const [state, action, pending] = useActionState(sendEmail, initial);

  if (state.success) {
    return (
      <div className="rounded border border-rio-green/40 bg-rio-green/10 px-4 py-3 text-sm text-rio-green">
        email enviado com sucesso.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">de</label>
        <input
          name="from"
          type="email"
          defaultValue="inbox@riov.com.br"
          required
          className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 focus:border-rio-green focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">para</label>
        <input
          name="to"
          type="email"
          placeholder="destinatario@exemplo.com"
          required
          className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rio-green focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">assunto</label>
        <input
          name="subject"
          type="text"
          placeholder="assunto"
          required
          className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rio-green focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">mensagem</label>
        <textarea
          name="body"
          rows={10}
          required
          className="resize-y rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-rio-green focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-end rounded border border-rio-green px-5 py-2 text-sm hover:bg-rio-green hover:text-zinc-900 disabled:opacity-50"
      >
        {pending ? "enviando..." : "enviar"}
      </button>
    </form>
  );
}
