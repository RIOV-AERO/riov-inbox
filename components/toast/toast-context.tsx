"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { LucideIcon } from "lucide-react";

export type ToastVariant = "success" | "error" | "neutral";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastInput {
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: ToastAction;
  /** Only meaningful for the "neutral" variant — success/error have fixed icons. */
  icon?: LucideIcon;
}

export interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: ToastInput) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
