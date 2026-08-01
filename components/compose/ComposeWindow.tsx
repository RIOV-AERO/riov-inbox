"use client";

import { useTransition, useRef, useState } from "react";
import { Minus, X, ChevronUp, Send, Paperclip, Trash2 } from "lucide-react";
import { useCompose } from "./compose-context";
import { useToast } from "../toast/toast-context";
import {
  sendComposeAction,
  type SendComposeState,
} from "@/app/(app)/compose/actions";
import { attachmentBadge } from "@/lib/attachment-style";
import { formatBytes } from "@/lib/format";
import { FROM_ADDRESS } from "@/lib/resend";

const initialState: SendComposeState = {};

export function ComposeWindow({
  user,
}: {
  user?: { email: string; registeredEmails?: string[] };
}) {
  const { status, draft, key, minimize, restore, close } = useCompose();

  if (status === "closed") return null;
  if (status === "minimized") {
    return (
      <MinimizedBar
        subject={draft.subject}
        onRestore={restore}
        onClose={close}
      />
    );
  }

  return (
    <ComposeForm
      key={key}
      user={user}
      draft={draft}
      onMinimize={minimize}
      onClose={close}
    />
  );
}

function MinimizedBar({
  subject,
  onRestore,
  onClose,
}: {
  subject?: string;
  onRestore: () => void;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-auto flex w-80 items-center gap-2.5 rounded-t-riov-lg bg-ink px-4.5 py-3.5 text-white shadow-riov-toast sm:w-90">
      <span className="size-1.5 shrink-0 rounded-full bg-accent" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {subject || "Nova mensagem"}
      </span>
      <button
        type="button"
        onClick={onRestore}
        className="text-white/60 hover:text-white"
      >
        <ChevronUp size={16} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ComposeForm({
  user,
  draft,
  onMinimize,
  onClose,
}: {
  user?: { email: string; registeredEmails?: string[] };
  draft: {
    to?: string;
    subject?: string;
    body?: string;
    replyToEmailId?: string;
  };
  onMinimize: () => void;
  onClose: () => void;
}) {
  const [isSending, startSending] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { push } = useToast();

  const [showCc, setShowCc] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function syncFiles(next: File[]) {
    setFiles(next);
    const dt = new DataTransfer();
    next.forEach((file) => dt.items.add(file));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorMessage(null);

    push({
      variant: "neutral",
      title: "Enviando e-mail…",
    });
    onClose();

    startSending(async () => {
      const res = await sendComposeAction(initialState, formData);
      if (res.success) {
        push({
          variant: "success",
          title: "E-mail enviado",
          description: res.sentTo ? `Para ${res.sentTo}` : undefined,
        });
      } else {
        push({
          variant: "error",
          title: "Falha ao enviar e-mail",
          description: res.error || "Tente novamente mais tarde.",
        });
      }
    });
  }

  return (
    <div className="pointer-events-auto flex w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-riov-xl border border-border-strong bg-surface shadow-riov-float max-h-[min(680px,calc(100dvh-2rem))]">
      <div className="flex items-center gap-2.5 bg-ink px-4.5 py-3.5 text-white">
        <span className="flex-1 truncate text-sm font-semibold">
          {draft.subject || "Nova mensagem"}
        </span>
        <button
          type="button"
          onClick={onMinimize}
          className="text-white/55 hover:text-white"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-white/55 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        {draft.replyToEmailId && (
          <input
            type="hidden"
            name="replyToEmailId"
            value={draft.replyToEmailId}
          />
        )}

        {errorMessage && (
          <div className="mx-4.5 mt-3 rounded-riov-md border border-danger-border bg-danger-tint px-3.5 py-2 text-[13px] font-medium text-danger">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col px-4.5">
          <div className="flex items-center gap-3 border-b border-border-subtle py-3.5">
            <span className="w-14 shrink-0 text-[12.5px] font-semibold text-ink-muted">
              De
            </span>
            <input
              name="from"
              type="text"
              list="compose-from-suggestions"
              defaultValue={user?.email || FROM_ADDRESS}
              placeholder="seu-email@riov.com.br ou setor"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <datalist id="compose-from-suggestions">
              {user?.email && <option value={user.email} />}
              {user?.registeredEmails?.map((email) => (
                <option key={email} value={email} />
              ))}
              {FROM_ADDRESS !== user?.email && <option value={FROM_ADDRESS} />}
            </datalist>
          </div>
          <div className="flex items-center gap-3 border-b border-border-subtle py-3.5">
            <span className="w-14 shrink-0 text-[12.5px] font-semibold text-ink-muted">
              Para
            </span>
            <input
              name="to"
              type="text"
              required
              defaultValue={draft.to}
              placeholder="nome@empresa.com"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="shrink-0 text-[12.5px] font-semibold text-ink-muted hover:text-ink-secondary"
              >
                Cc
              </button>
            )}
          </div>
          {showCc && (
            <div className="flex items-center gap-3 border-b border-border-subtle py-3.5">
              <span className="w-14 shrink-0 text-[12.5px] font-semibold text-ink-muted">
                Cc
              </span>
              <input
                name="cc"
                type="text"
                placeholder="copia@empresa.com"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
          )}
          <div className="flex items-center gap-3 border-b border-border-subtle py-3.5">
            <span className="w-14 shrink-0 text-[12.5px] font-semibold text-ink-muted">
              Assunto
            </span>
            <input
              name="subject"
              type="text"
              required
              defaultValue={draft.subject}
              placeholder="Sobre o que é?"
              className="flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-faint"
            />
          </div>
          <textarea
            name="body"
            required
            defaultValue={draft.body}
            placeholder="Escreva sua mensagem…"
            className="min-h-47.5 flex-1 resize-none bg-transparent py-4 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
          />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pb-3.5">
              {files.map((file, i) => {
                const badge = attachmentBadge(file.name, file.type);
                return (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2.5 rounded-riov-md border border-border-subtle bg-frame/40 px-3 py-2.5"
                  >
                    <div
                      className="flex size-7.5 shrink-0 items-center justify-center rounded-riov-sm text-[9px] font-bold"
                      style={{ background: badge.bg, color: badge.fg }}
                    >
                      {badge.label}
                    </div>
                    <div className="min-w-0">
                      <div className="max-w-35 truncate text-[13px] font-semibold text-ink">
                        {file.name}
                      </div>
                      <div className="text-[11.5px] text-ink-muted">
                        {formatBytes(file.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        syncFiles(files.filter((_, idx) => idx !== i))
                      }
                      className="text-ink-muted hover:text-danger"
                    >
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          name="attachments"
          multiple
          hidden
          onChange={(e) =>
            syncFiles([...files, ...Array.from(e.target.files ?? [])])
          }
        />

        <div className="flex items-center gap-2.5 border-t border-border-subtle px-4.5 py-3.5">
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center gap-2 rounded-full bg-accent px-5.5 py-2.5 text-sm font-semibold text-white shadow-riov-cta transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSending ? (
              <>
                <span className="size-3.5 animate-riov-spin rounded-full border-2 border-white/35 border-t-white" />
                Enviando…
              </>
            ) : (
              <>
                Enviar
                <Send size={15} />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-3 py-2 text-sm font-semibold text-ink-secondary hover:text-ink"
          >
            Cancelar
          </button>
          <div className="ml-auto flex items-center gap-3.5 text-ink-muted">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-ink-secondary"
              title="Anexar arquivo"
            >
              <Paperclip size={17} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={() => syncFiles([])}
              className="hover:text-danger"
              title="Remover anexos"
            >
              <Trash2 size={17} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
