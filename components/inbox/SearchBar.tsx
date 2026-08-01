"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar({
  placeholder = "Buscar por assunto, remetente…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={`flex h-11 max-w-130 flex-1 items-center gap-2.5 rounded-full border bg-page px-4.5 transition-shadow ${
        focused
          ? "border-accent bg-surface shadow-[0_0_0_4px_rgba(0,168,107,0.14)]"
          : "border-border"
      }`}
    >
      <Search
        size={16}
        strokeWidth={1.8}
        className={focused ? "text-accent" : "text-ink-muted"}
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-frame text-ink-secondary"
        >
          <X size={11} strokeWidth={2.4} />
        </button>
      ) : (
        <span className="shrink-0 rounded-1.5 border border-border bg-surface px-1.5 py-1 font-mono text-[11px] font-semibold text-ink-faint">
          ⌘K
        </span>
      )}
    </div>
  );
}
