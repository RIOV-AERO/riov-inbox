"use client";

import { Check, X, Info } from "lucide-react";
import { useToast, type ToastItem } from "./toast-context";

function ToastIcon({ toast }: { toast: ToastItem }) {
  if (toast.variant === "success") {
    return (
      <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-accent">
        <Check size={14} strokeWidth={2.6} className="text-white" />
      </span>
    );
  }
  if (toast.variant === "error") {
    return (
      <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-danger">
        <X size={13} strokeWidth={2.6} className="text-white" />
      </span>
    );
  }
  const Icon = toast.icon ?? Info;
  return (
    <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-frame">
      <Icon size={14} strokeWidth={1.8} className="text-ink-secondary" />
    </span>
  );
}

function ToastRow({ toast }: { toast: ToastItem }) {
  const { dismiss } = useToast();
  const dark = toast.variant === "success" || toast.variant === "error";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex min-w-85 max-w-sm items-center gap-3 rounded-riov-lg px-5 py-3.5 shadow-riov-toast ${
        dark ? "bg-ink text-white" : "border border-border bg-surface text-ink"
      }`}
    >
      <ToastIcon toast={toast} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{toast.title}</div>
        {toast.description && (
          <div
            className={`truncate text-[12.5px] ${dark ? "text-white/65" : "text-ink-muted"}`}
          >
            {toast.description}
          </div>
        )}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
          className={
            toast.variant === "error"
              ? "shrink-0 rounded-full border border-white/25 px-3 py-1.5 text-[13px] font-semibold text-white"
              : dark
                ? "shrink-0 text-[13px] font-semibold text-[#4FD7A4]"
                : "shrink-0 text-[13px] font-semibold text-accent-hover"
          }
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export function ToastStack() {
  const { toasts } = useToast();
  return (
    <div className="flex flex-col items-end gap-3">
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
