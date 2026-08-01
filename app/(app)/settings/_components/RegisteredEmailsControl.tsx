"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import {
  addRegisteredEmailAction,
  removeRegisteredEmailAction,
} from "../actions";

export function RegisteredEmailsControl({
  initialEmails,
}: {
  initialEmails: string[];
}) {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError(null);

    const emailToAdd = newEmail.trim();

    startTransition(async () => {
      const res = await addRegisteredEmailAction(emailToAdd);
      if (res.error) {
        setError(res.error);
      } else {
        setEmails((prev) => [...prev, emailToAdd.toLowerCase()]);
        setNewEmail("");
      }
    });
  };

  const handleRemove = (emailToRemove: string) => {
    setError(null);

    startTransition(async () => {
      const res = await removeRegisteredEmailAction(emailToRemove);
      if (res.error) {
        setError(res.error);
      } else {
        setEmails((prev) => prev.filter((e) => e !== emailToRemove));
      }
    });
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {error && (
        <div className="rounded-riov-md border border-danger-border bg-danger-tint px-3.5 py-2 text-[13px] font-medium text-danger">
          {error}
        </div>
      )}

      {emails.length === 0 ? (
        <div className="text-[13px] text-ink-muted italic">
          Nenhum endereço adicional cadastrado.
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-frame px-3 py-1 text-xs font-semibold text-ink"
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => handleRemove(email)}
                disabled={isPending}
                aria-label={`Remover ${email}`}
                className="flex size-4 items-center justify-center rounded-full text-ink-muted hover:bg-border hover:text-ink disabled:opacity-50"
              >
                <X size={12} strokeWidth={2.2} />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="ex: financeiro@riov.com.br ou financeiro"
          disabled={isPending}
          className="flex-1 rounded-riov-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        <button
          type="submit"
          disabled={isPending || !newEmail.trim()}
          className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-ink/90 disabled:opacity-50"
        >
          <Plus size={13} strokeWidth={2.2} />
          <span>Adicionar</span>
        </button>
      </form>
    </div>
  );
}
