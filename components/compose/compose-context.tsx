"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface ComposePrefill {
  to?: string;
  subject?: string;
  body?: string;
  replyToEmailId?: string;
}

type ComposeStatus = "closed" | "open" | "minimized";

interface ComposeContextValue {
  status: ComposeStatus;
  draft: ComposePrefill;
  key: number;
  openCompose: (prefill?: ComposePrefill) => void;
  minimize: () => void;
  restore: () => void;
  close: () => void;
}

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ComposeStatus>("closed");
  const [draft, setDraft] = useState<ComposePrefill>({});
  // Bumped on every openCompose() so the window remounts with fresh
  // uncontrolled field defaults instead of carrying over stale text.
  const [key, setKey] = useState(0);

  const openCompose = useCallback((prefill: ComposePrefill = {}) => {
    setDraft(prefill);
    setStatus("open");
    setKey((k) => k + 1);
  }, []);

  const minimize = useCallback(() => setStatus("minimized"), []);
  const restore = useCallback(() => setStatus("open"), []);
  const close = useCallback(() => setStatus("closed"), []);

  const value = useMemo(
    () => ({ status, draft, key, openCompose, minimize, restore, close }),
    [status, draft, key, openCompose, minimize, restore, close],
  );

  return (
    <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>
  );
}

export function useCompose(): ComposeContextValue {
  const ctx = useContext(ComposeContext);
  if (!ctx) throw new Error("useCompose must be used within a ComposeProvider");
  return ctx;
}
